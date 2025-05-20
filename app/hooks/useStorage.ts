'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { useFirebaseAuth } from '@/app/contexts/FirebaseAuthContext';
import { clientStorage } from '@/app/lib/firebase';

export function useStorage() {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Upload audio file
  const uploadAudio = useCallback(async (file: File, path: string, metadata: Record<string, string> = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const fileRef = ref(clientStorage, `users/${user.uid}/${path}`);
      await uploadBytes(fileRef, file, { customMetadata: metadata });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to upload audio.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete audio file
  const deleteAudio = useCallback(async (path: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const fileRef = ref(clientStorage, `users/${user.uid}/${path}`);
      await deleteObject(fileRef);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to delete audio.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get Audio URL
  const getAudioUrl = useCallback(async (path: string) => {
    if (!user) return null;
    const fileRef = ref(clientStorage, `users/${user.uid}/${path}`);
    const url = await getDownloadURL(fileRef);
    return url;
  }, [user]);

  return { uploadAudio, deleteAudio, getAudioUrl, loading, error, success };
} 