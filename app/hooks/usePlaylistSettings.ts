'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirebaseAuth } from '@/app/contexts/FirebaseAuthContext';
import { clientDb } from '@/app/lib/firebase';

export interface PlaylistSettings {
  playlistId: string;
  introsEnabled: boolean;
  prompt: string;
  updatedAt: Date;
}

export function usePlaylistSettings(playlistId: string) {
  const { user } = useFirebaseAuth();
  const [settings, setSettings] = useState<PlaylistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const docRef = doc(clientDb, `users/${user.uid}/playlistSettings/settings`);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const playlists: PlaylistSettings[] = data.playlists || [];
          const found = playlists.find((p) => p.playlistId === playlistId);
          setSettings(found || null);
        } else {
          setSettings(null);
        }
      })
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, [user, playlistId]);

  const saveSettings = useCallback(async (newSettings: { introsEnabled: boolean; prompt: string }) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const docRef = doc(clientDb, `users/${user.uid}/playlistSettings/settings`);
      const docSnap = await getDoc(docRef);
      let playlists: PlaylistSettings[] = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        playlists = data.playlists || [];
      }
      const idx = playlists.findIndex((p) => p.playlistId === playlistId);
      const updatedAt = new Date();
      if (idx >= 0) {
        playlists[idx] = { ...playlists[idx], ...newSettings, updatedAt };
      } else {
        playlists.push({ playlistId, ...newSettings, updatedAt });
      }
      await setDoc(docRef, { playlists }, { merge: true });
      setSettings(playlists.find((p) => p.playlistId === playlistId) || null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }, [user, playlistId]);

  return { settings, loading, error, saving, success, saveSettings };
} 