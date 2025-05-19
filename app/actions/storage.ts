'use server';

import { verifyAuth } from '@/app/lib/firebase-admin';
import { uploadFile, deleteFile, getStorageStats, cleanupStorage } from '@/app/lib/storage-service';
import { AuthError } from '@/app/lib/AuthError';

export async function uploadTrackAudio(
  file: Buffer,
  path: string,
  contentType: string,
  metadata: Record<string, string>
) {
  try {
    // Verify authentication
    const userId = await verifyAuth();

    // Upload file
    const result = await uploadFile(userId, file, path, contentType, metadata);

    if (!result.success) {
      throw new AuthError(result.error?.message || 'Failed to upload file', 'STORAGE_FAILED');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error uploading track audio:', error);
    throw new AuthError('Failed to upload track audio', 'STORAGE_FAILED');
  }
}

export async function deleteTrackAudio(path: string) {
  try {
    // Verify authentication
    const userId = await verifyAuth();

    // Delete file
    const result = await deleteFile(userId, path);

    if (!result.success) {
      throw new AuthError(result.error?.message || 'Failed to delete file', 'STORAGE_FAILED');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting track audio:', error);
    throw new AuthError('Failed to delete track audio', 'STORAGE_FAILED');
  }
}

export async function getStorageUsage() {
  try {
    // Verify authentication
    const userId = await verifyAuth();

    // Get storage stats
    const stats = await getStorageStats(userId);

    // Check if cleanup is needed
    if (stats.quota.percentage >= 0.9) {
      await cleanupStorage(userId);
      // Get updated stats after cleanup
      return { success: true, data: await getStorageStats(userId) };
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting storage usage:', error);
    throw new AuthError('Failed to get storage usage', 'STORAGE_FAILED');
  }
} 