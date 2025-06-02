export interface StorageFile {
  path: string;
  url: string;
  size: number;
  contentType: string;
  metadata: Record<string, string>;
  createdAt: Date;
  lastAccessed: Date;
}

export interface StorageResult {
  success: boolean;
  data?: StorageFile;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

import { adminStorage } from './firebase-admin';

export async function uploadFile(
  userId: string,
  file: Buffer,
  path: string,
  contentType: string,
  fileMetadata: Record<string, string>
): Promise<StorageResult> {
  try {
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
    await fileRef.delete();
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