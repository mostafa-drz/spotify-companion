export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
}

export interface TrackPlayback {
  trackId: string;
  introUrl?: string;
  trackUrl: string;
  introDuration: number;
  trackDuration: number;
  hasIntro: boolean;
  playlistId: string;
  playlistName?: string;
}

export interface PlaybackError {
  code: 'LOAD_FAILED' | 'PLAYBACK_FAILED' | 'NETWORK_ERROR' | 'AUDIO_ERROR';
  message: string;
  details?: unknown;
}

export interface PlaybackEvent {
  type: 'play' | 'pause' | 'seek' | 'volume' | 'rate' | 'end' | 'error';
  timestamp: number;
  data?: unknown;
}

export interface PlaybackAnalytics {
  trackId: string;
  playlistId: string;
  introPlayed: boolean;
  introSkipped: boolean;
  introDuration: number;
  trackDuration: number;
  totalPlayTime: number;
  events: PlaybackEvent[];
} 