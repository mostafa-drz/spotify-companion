'use server';

import { adminDb } from '@/app/lib/firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';

export interface PlaylistSettings {
  playlistId: string;
  introsEnabled: boolean;
  prompt: string;
  updatedAt: Date;
}

const PLAYLIST_SETTINGS_COLLECTION = 'playlistSettings';
const USERS_COLLECTION = 'users';

// Get settings for a single playlist for the current user
export async function getPlaylistSettings(playlistId: string): Promise<PlaylistSettings | null> {
  const userId = await verifyAuth();
  const docRef = adminDb.collection(USERS_COLLECTION).doc(userId).collection(PLAYLIST_SETTINGS_COLLECTION).doc('settings');
  const doc = await docRef.get();
  if (!doc.exists) return null;
  const data = doc.data();
  const playlists: PlaylistSettings[] = data?.playlists || [];
  const found = playlists.find((p) => p.playlistId === playlistId);
  return found || null;
}

// Save or update settings for a single playlist for the current user
export async function savePlaylistSettings(playlistId: string, settings: { introsEnabled: boolean; prompt: string }): Promise<void> {
  const userId = await verifyAuth();
  const docRef = adminDb.collection(USERS_COLLECTION).doc(userId).collection(PLAYLIST_SETTINGS_COLLECTION).doc('settings');
  const doc = await docRef.get();
  let playlists: PlaylistSettings[] = [];
  if (doc.exists) {
    playlists = doc.data()?.playlists || [];
  }
  const idx = playlists.findIndex((p) => p.playlistId === playlistId);
  const updatedAt = new Date();
  if (idx >= 0) {
    playlists[idx] = { ...playlists[idx], ...settings, updatedAt };
  } else {
    playlists.push({ playlistId, ...settings, updatedAt });
  }
  await docRef.set({ playlists }, { merge: true });
} 