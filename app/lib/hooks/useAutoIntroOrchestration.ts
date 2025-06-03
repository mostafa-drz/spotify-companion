import { useEffect, useRef, useState } from 'react';
import type { SpotifyTrack } from '@/app/types/Spotify';
import type { PromptTemplate } from '@/app/types/Prompt';

interface UseAutoIntroOrchestrationProps {
  introsEnabled: boolean;
  currentTrack?: SpotifyTrack;
  selectedTemplate?: PromptTemplate;
  currentIntro?: { audioUrl?: string } | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
}

type OrchestrationState =
  | 'idle'
  | 'waiting'
  | 'playing-intro'
  | 'resuming'
  | 'error';

export function useAutoIntroOrchestration({
  introsEnabled,
  currentTrack,
  selectedTemplate,
  currentIntro,
  audioRef,
  isPlaying,
  togglePlay,
}: UseAutoIntroOrchestrationProps) {
  const [orchestratedFor, setOrchestratedFor] = useState<string | null>(null);
  const [state, setState] = useState<OrchestrationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Stop intro audio when Spotify starts playing
  useEffect(() => {
    if (isPlaying && audioRef.current && state === 'playing-intro') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState('idle');
    }
  }, [isPlaying, audioRef, state]);

  // Orchestrate auto-intro on track/template change
  useEffect(() => {
    if (!introsEnabled || !currentTrack?.id || !selectedTemplate?.id) {
      setState('idle');
      return;
    }

    const key = `${currentTrack.id}_${selectedTemplate.id}`;
    if (orchestratedFor === key) return;

    const startIntroPlayback = async () => {
      try {
        // 1. Pause Spotify playback if playing
        if (isPlaying) {
          togglePlay();
          setState('waiting');
        }

        // 2. Wait for intro audio to be ready
        if (currentIntro?.audioUrl && audioRef.current) {
          // 3. Play intro audio
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          setState('playing-intro');
          setOrchestratedFor(key);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to play intro:', err);
        setError(err instanceof Error ? err.message : 'Failed to play intro');
        setState('error');
        // Resume Spotify if we failed to play intro
        if (!isPlaying) {
          togglePlay();
        }
      }
    };

    startIntroPlayback();

    return cleanup;
  }, [
    introsEnabled,
    currentTrack?.id,
    selectedTemplate?.id,
    currentIntro?.audioUrl,
    isPlaying,
    togglePlay,
    audioRef,
    orchestratedFor,
  ]);

  // Resume Spotify playback when intro audio ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setState('resuming');
      togglePlay();
      // Reset state after resuming
      timeoutRef.current = setTimeout(() => {
        setState('idle');
        setError(null);
      }, 500);
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setError('Failed to play intro audio');
      setState('error');
      // Resume Spotify if we had an error
      if (!isPlaying) {
        togglePlay();
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    return () => {
      cleanup();
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError as EventListener);
      }
    };
  }, [audioRef, togglePlay, isPlaying]);

  // Reset orchestration on track/template change
  useEffect(() => {
    setOrchestratedFor(null);
    setState('idle');
    setError(null);
    cleanup();
  }, [currentTrack?.id, selectedTemplate?.id, introsEnabled]);

  return {
    state,
    error,
    isOrchestrating: state !== 'idle' && state !== 'error',
  };
}
