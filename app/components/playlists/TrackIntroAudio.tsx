'use client';

import { useState, useEffect } from 'react';
import { useStorage } from '@/app/hooks/useStorage';
import { generateTrackTTS } from '@/app/actions/tts';

interface TrackIntroAudioProps {
  trackId: string;
  introText: string;
}

export default function TrackIntroAudio({ trackId, introText }: TrackIntroAudioProps) {
  const { getAudioUrl, loading: storageLoading, error: storageError } = useStorage();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  // Try to get existing audio URL first
  useEffect(() => {
    const loadAudioUrl = async () => {
      try {
        const url = await getAudioUrl(`tts/${trackId}.mp3`);
        if (url) {
          setAudioUrl(url);
        }
      } catch (err: unknown) {
        // Only set error if it's not a 'not found' error
        if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof (err as { message: unknown }).message === 'string' &&
          !((err as { message: string }).message.includes('object-not-found'))
        ) {
          setError('Failed to load audio.');
        }
        // Otherwise, do nothing: file just doesn't exist yet
      }
    };
    loadAudioUrl();
  }, [trackId, getAudioUrl]);

  const handleGenerateAndPlay = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateTrackTTS(trackId, introText);
      if (result.url) {
        setAudioUrl(result.url);
        const audioEl = new Audio(result.url);
        audioEl.play();
        setPlaying(true);
        audioEl.onended = () => setPlaying(false);
      } else {
        setError(result.error || 'Failed to generate audio.');
      }
    } catch {
      setError('Failed to generate audio.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audioEl = new Audio(audioUrl);
      audioEl.play();
      setPlaying(true);
      audioEl.onended = () => setPlaying(false);
    }
  };

  if (storageLoading) {
    return <div className="mt-2 text-neutral">Loading audio...</div>;
  }

  if (storageError) {
    return <div className="mt-2 text-semantic-error">{storageError}</div>;
  }

  return (
    <div className="mt-2">
      {audioUrl ? (
        <button
          onClick={handlePlay}
          disabled={playing}
          className="btn btn-primary px-4 py-1 rounded disabled:opacity-60"
          aria-label={playing ? 'Playing intro' : 'Play intro'}
        >
          {playing ? 'Playing...' : 'Play Intro'}
        </button>
      ) : (
        <button
          onClick={handleGenerateAndPlay}
          disabled={loading}
          className="btn btn-primary px-4 py-1 rounded disabled:opacity-60"
          aria-label={loading ? 'Generating intro' : 'Generate and play intro'}
        >
          {loading ? 'Generating...' : 'Generate & Play Intro'}
        </button>
      )}
      {error && <div className="text-semantic-error mt-2">{error}</div>}
    </div>
  );
} 