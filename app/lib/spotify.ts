import { auth } from '@/app/auth';

// Types
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
  collaborative: boolean;
  tracks: {
    href: string;
    total: number;
  };
  uri: string;
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaylistTracksResponse {
  items: {
    added_at: string;
    track: SpotifyTrack;
  }[];
  total: number;
}

// Error types
export class SpotifyError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SpotifyError';
  }
}

// API Functions
async function getAccessToken() {
  const session = await auth();
  if (!session?.accessToken) {
    throw new SpotifyError('Not authenticated', 401, 'UNAUTHENTICATED');
  }
  return session.accessToken;
}

async function fetchFromSpotify<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  const token = await getAccessToken();
  
  const queryString = params 
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';

  const response = await fetch(
    `https://api.spotify.com/v1${endpoint}${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new SpotifyError(
      error.error?.message || 'Failed to fetch from Spotify',
      response.status,
      error.error?.status
    );
  }

  return response.json();
}

// Public API
export async function getCurrentUserPlaylists(
  limit = 20,
  offset = 0
): Promise<SpotifyPlaylistsResponse> {
  try {
    return await fetchFromSpotify<SpotifyPlaylistsResponse>('/me/playlists', {
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error;
    }
    console.error('Failed to fetch playlists:', error);
    throw new SpotifyError('Failed to fetch playlists');
  }
}

export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  try {
    return await fetchFromSpotify<SpotifyPlaylist>(`/playlists/${playlistId}`);
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error;
    }
    console.error('Failed to fetch playlist:', error);
    throw new SpotifyError('Failed to fetch playlist');
  }
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyPlaylistTracksResponse> {
  try {
    return await fetchFromSpotify<SpotifyPlaylistTracksResponse>(`/playlists/${playlistId}/tracks`);
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error;
    }
    console.error('Failed to fetch playlist tracks:', error);
    throw new SpotifyError('Failed to fetch playlist tracks');
  }
}

// Player control functions
export async function playTrack(deviceId: string, trackUri: string): Promise<void> {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SpotifyError(
        error.error?.message || 'Failed to play track',
        response.status,
        error.error?.status
      );
    }
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error;
    }
    console.error('Failed to play track:', error);
    throw new SpotifyError('Failed to play track');
  }
}

export async function pausePlayback(deviceId: string): Promise<void> {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SpotifyError(
        error.error?.message || 'Failed to pause playback',
        response.status,
        error.error?.status
      );
    }
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error;
    }
    console.error('Failed to pause playback:', error);
    throw new SpotifyError('Failed to pause playback');
  }
}

export async function resumePlayback(deviceId: string): Promise<void> {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SpotifyError(
        error.error?.message || 'Failed to resume playback',
        response.status,
        error.error?.status
      );
    }
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error;
    }
    console.error('Failed to resume playback:', error);
    throw new SpotifyError('Failed to resume playback');
  }
} 