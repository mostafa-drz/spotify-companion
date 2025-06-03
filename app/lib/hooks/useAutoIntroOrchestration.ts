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
  const [state, setState] = useState<'idle' | 'waiting' | 'playing-intro' | 'resuming'>('idle');

  // Orchestrate auto-intro on track/template change
  useEffect(() => {
    if (!introsEnabled || !currentTrack?.id || !selectedTemplate?.id) return;
    const key = `${currentTrack.id}_${selectedTemplate.id}`;
    if (orchestratedFor === key) return;

    // 1. Pause Spotify playback if playing
    if (isPlaying) {
      togglePlay();
      setState('waiting');
    }

    // 2. Wait for intro audio to be ready
    if (currentIntro?.audioUrl && audioRef.current) {
      // 3. Play intro audio
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setState('playing-intro');
      setOrchestratedFor(key);
    }
  }, [introsEnabled, currentTrack?.id, selectedTemplate?.id, currentIntro?.audioUrl]);

  // Resume Spotify playback when intro audio ends
  useEffect(() => {
    if (!audioRef.current) return;
    const handleEnded = () => {
      setState('resuming');
      togglePlay();
      setTimeout(() => setState('idle'), 500); // Reset state after resuming
    };
    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, togglePlay]);

  // Reset orchestration on track/template change
  useEffect(() => {
    setOrchestratedFor(null);
    setState('idle');
  }, [currentTrack?.id, selectedTemplate?.id, introsEnabled]);

  return { state };
} 