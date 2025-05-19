export interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
  playlistId: string;
  playlistName?: string;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  format: string;
  size: number;
}

export interface TTSVoice {
  name: string;
  language: string;
  gender: 'male' | 'female';
  previewUrl?: string;
}

export interface TTSGenerationError {
  code: 'TTS_FAILED' | 'INVALID_REQUEST' | 'QUOTA_EXCEEDED';
  message: string;
  details?: unknown;
}

export interface TTSGenerationResult {
  success: boolean;
  data?: TTSResponse;
  error?: TTSGenerationError;
  metadata: {
    playlistId: string;
    timestamp: Date;
    attempt: number;
  };
} 