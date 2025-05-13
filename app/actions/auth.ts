'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function getUserPlaylists() {
  const session = await auth();
  
  if (!session?.accessToken) {
    throw new Error('No access token available');
  }

  // Fetch user's playlists from Spotify
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  return response.json();
} 