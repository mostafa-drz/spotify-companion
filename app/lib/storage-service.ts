import { adminStorage, adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { StorageFile, StorageResult, StorageStats } from '../types/Storage';

const STORAGE_QUOTA_LIMIT = 100 * 1024 * 1024; // 100MB per user
const CLEANUP_THRESHOLD = 0.9; // 90% of quota

export async function uploadFile(
  userId: string,
  file: Buffer,
  path: string,
  contentType: string,
  fileMetadata: Record<string, string>
): Promise<StorageResult> {
  try {
    // Check quota before upload
    const stats = await getStorageStats(userId);
    if (stats.quota.percentage >= 1) {
      return {
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Storage quota exceeded'
        }
      };
    }

    // Upload file
    const fileRef = adminStorage.bucket().file(`users/${userId}/${path}`);
    await fileRef.save(file, {
      metadata: {
        contentType,
        metadata: {
          ...fileMetadata,
          userId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Get file metadata
    const [fileMetadataResult] = await fileRef.getMetadata();
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Long expiration for now
    });

    if (!fileMetadataResult) {
      throw new Error('Failed to get file metadata');
    }

    const storageFile: StorageFile = {
      path: fileRef.name,
      url,
      size: parseInt(String(fileMetadataResult.size || '0')),
      contentType: fileMetadataResult.contentType || 'application/octet-stream',
      metadata: fileMetadataResult.metadata as Record<string, string>,
      createdAt: new Date(fileMetadataResult.timeCreated || Date.now()),
      lastAccessed: new Date()
    };

    // Update storage stats
    await updateStorageStats(userId, storageFile.size);

    return { success: true, data: storageFile };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to upload file'
      }
    };
  }
}

export async function deleteFile(userId: string, path: string): Promise<StorageResult> {
  try {
    const fileRef = adminStorage.bucket().file(`users/${userId}/${path}`);
    const [fileMetadata] = await fileRef.getMetadata();
    
    if (!fileMetadata) {
      throw new Error('Failed to get file metadata');
    }

    await fileRef.delete();

    // Update storage stats
    await updateStorageStats(userId, -parseInt(String(fileMetadata.size || '0')));

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete file'
      }
    };
  }
}

export async function getStorageStats(userId: string): Promise<StorageStats> {
  const statsRef = adminDb.collection('storageStats').doc(userId);
  const statsDoc = await statsRef.get();
  
  if (!statsDoc.exists) {
    return {
      totalFiles: 0,
      totalSize: 0,
      quota: {
        used: 0,
        limit: STORAGE_QUOTA_LIMIT,
        percentage: 0
      },
      lastCleanup: new Date()
    };
  }

  const data = statsDoc.data();
  return {
    totalFiles: data?.totalFiles || 0,
    totalSize: data?.totalSize || 0,
    quota: {
      used: data?.totalSize || 0,
      limit: STORAGE_QUOTA_LIMIT,
      percentage: (data?.totalSize || 0) / STORAGE_QUOTA_LIMIT
    },
    lastCleanup: data?.lastCleanup?.toDate() || new Date()
  };
}

async function updateStorageStats(userId: string, sizeDelta: number): Promise<void> {
  const statsRef = adminDb.collection('storageStats').doc(userId);
  await statsRef.set({
    totalSize: FieldValue.increment(sizeDelta),
    totalFiles: FieldValue.increment(sizeDelta > 0 ? 1 : -1),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

export async function cleanupStorage(userId: string): Promise<void> {
  const stats = await getStorageStats(userId);
  
  if (stats.quota.percentage < CLEANUP_THRESHOLD) {
    return;
  }

  // Get all files for user
  const [files] = await adminStorage.bucket().getFiles({
    prefix: `users/${userId}/`
  });

  // Sort by last accessed
  files.sort((a, b) => {
    const aTime = a.metadata?.timeCreated || '';
    const bTime = b.metadata?.timeCreated || '';
    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });

  // Delete oldest files until under threshold
  for (const file of files) {
    if (stats.quota.percentage < CLEANUP_THRESHOLD) {
      break;
    }

    const [fileMetadata] = await file.getMetadata();
    if (!fileMetadata) continue;

    await file.delete();
    await updateStorageStats(userId, -parseInt(String(fileMetadata.size || '0')));
  }

  // Update last cleanup time
  await adminDb.collection('storageStats').doc(userId).update({
    lastCleanup: FieldValue.serverTimestamp()
  });
} 