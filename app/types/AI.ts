export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  releaseDate?: string;
  genres?: string[];
  popularity?: number;
}

export interface AIRequest {
  trackMetadata: TrackMetadata;
  promptTemplate: string;
  customPrompt?: string;
  playlistId: string;
  playlistName?: string;
}

export interface AIResponse {
  text: string;
  duration: number; // in seconds
  tokens: number;
  model: string;
}

export interface AIGenerationError {
  code: 'RATE_LIMIT' | 'INVALID_REQUEST' | 'MODEL_ERROR' | 'UNKNOWN';
  message: string;
  retryable: boolean;
  retryAfter?: number; // in seconds
}

export interface AIGenerationResult {
  success: boolean;
  data?: AIResponse;
  error?: AIGenerationError;
  metadata: {
    trackId: string;
    promptId: string;
    playlistId: string;
    timestamp: Date;
    attempt: number;
  };
} 