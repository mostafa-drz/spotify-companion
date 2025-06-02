export interface SpotifyImage {
  url: string;
}

export interface SpotifyArtist {
  uri: string;
  name: string;
}

export interface SpotifyAlbum {
  uri: string;
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  uri: string;
  id: string | null;
  type: 'track' | 'episode' | 'ad';
  media_type: 'audio' | 'video';
  name: string;
  is_playable: boolean;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  playlistId?: string;
}

// Web Playback SDK types
export interface WebPlaybackTrack {
  uri: string;
  id: string | null;
  type: 'track' | 'episode' | 'ad';
  media_type: 'audio' | 'video';
  name: string;
  is_playable: boolean;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export interface WebPlaybackContext {
  uri: string | null;
  metadata: Record<string, unknown> | null;
}

export interface WebPlaybackDisallows {
  pausing?: boolean;
  peeking_next?: boolean;
  peeking_prev?: boolean;
  resuming?: boolean;
  seeking?: boolean;
  skipping_next?: boolean;
  skipping_prev?: boolean;
}

export interface WebPlaybackState {
  context: WebPlaybackContext;
  disallows: WebPlaybackDisallows;
  paused: boolean;
  position: number;
  repeat_mode: 0 | 1 | 2;
  shuffle: boolean;
  track_window: {
    current_track: WebPlaybackTrack;
    previous_tracks: WebPlaybackTrack[];
    next_tracks: WebPlaybackTrack[];
  };
}

// Web Playback SDK ready event player object
export interface WebPlaybackPlayer {
  device_id: string;
}

// Web Playback SDK error object
export interface WebPlaybackError {
  message: string;
}

export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album?: string;
  duration: number;
  releaseDate?: string;
  genres?: string[];
  popularity?: number;
  playlistId?: string | null;
  createdAt: string;
  updatedAt: string;
} 