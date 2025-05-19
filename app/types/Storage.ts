export interface StorageFile {
  path: string;
  url: string;
  size: number;
  contentType: string;
  metadata: Record<string, string>;
  createdAt: Date;
  lastAccessed: Date;
}

export interface StorageQuota {
  used: number;
  limit: number;
  percentage: number;
}

export interface StorageError {
  code: 'QUOTA_EXCEEDED' | 'FILE_NOT_FOUND' | 'UPLOAD_FAILED' | 'DELETE_FAILED';
  message: string;
  details?: unknown;
}

export interface StorageResult {
  success: boolean;
  data?: StorageFile;
  error?: StorageError;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  quota: StorageQuota;
  lastCleanup: Date;
} 