import { useState, useEffect, useCallback } from 'react';
import { playbackService } from '@/app/lib/playback-service';
import { PlaybackState, TrackPlayback, PlaybackEvent } from '@/app/types/Playback';

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>(playbackService.getState());
  const [currentTrack, setCurrentTrack] = useState<TrackPlayback | null>(null);

  // Update state when playback changes
  useEffect(() => {
    const updateState = () => setState(playbackService.getState());
    const handleEvent = (event: PlaybackEvent) => {
      if (['play', 'pause', 'seek', 'volume', 'rate'].includes(event.type)) {
        updateState();
      }
    };

    // Subscribe to events
    ['play', 'pause', 'seek', 'volume', 'rate'].forEach(eventType => {
      playbackService.on(eventType, handleEvent);
    });

    return () => {
      // Unsubscribe from events
      ['play', 'pause', 'seek', 'volume', 'rate'].forEach(eventType => {
        playbackService.off(eventType, handleEvent);
      });
    };
  }, []);

  // Load track
  const loadTrack = useCallback(async (track: TrackPlayback) => {
    try {
      await playbackService.loadTrack(track);
      setCurrentTrack(track);
      setState(playbackService.getState());
    } catch (error) {
      console.error('Error loading track:', error);
      throw error;
    }
  }, []);

  // Playback controls
  const play = useCallback(async () => {
    try {
      await playbackService.play();
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }, []);

  const pause = useCallback(() => {
    playbackService.pause();
  }, []);

  const skipIntro = useCallback(() => {
    playbackService.skipIntro();
  }, []);

  const seek = useCallback((time: number) => {
    playbackService.seek(time);
  }, []);

  const setVolume = useCallback((volume: number) => {
    playbackService.setVolume(volume);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackService.setPlaybackRate(rate);
  }, []);

  // Save analytics when component unmounts
  useEffect(() => {
    return () => {
      playbackService.saveAnalytics();
    };
  }, []);

  return {
    state,
    currentTrack,
    loadTrack,
    play,
    pause,
    skipIntro,
    seek,
    setVolume,
    setPlaybackRate
  };
} 