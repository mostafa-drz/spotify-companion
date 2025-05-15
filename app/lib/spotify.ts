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

// API Functions
async function getAccessToken() {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
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
    throw new Error(error.error?.message || 'Failed to fetch from Spotify');
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
    console.error('Failed to fetch playlists:', error);
    throw error;
  }
}

export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  try {
    return await fetchFromSpotify<SpotifyPlaylist>(`/playlists/${playlistId}`);
  } catch (error) {
    console.error('Failed to fetch playlist:', error);
    throw error;
  }
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyPlaylistTracksResponse> {
  try {
    return await fetchFromSpotify<SpotifyPlaylistTracksResponse>(`/playlists/${playlistId}/tracks`);
  } catch (error) {
    console.error('Failed to fetch playlist tracks:', error);
    throw error;
  }
} 