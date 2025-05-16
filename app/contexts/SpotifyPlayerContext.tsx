'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SpotifyError } from '@/app/lib/spotify';

// Spotify Player types
interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (state: SpotifyPlayerState) => void) => void;
  removeListener: (event: string, callback: (state: SpotifyPlayerState) => void) => void;
  activateElement: () => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  volume: number;
  track_window: {
    current_track: {
      name: string;
      artists: Array<{ name: string }>;
      album: {
        images: Array<{ url: string }>;
      };
    };
  };
}

interface SpotifyPlayerContextType {
  player: SpotifyPlayer | null;
  deviceId: string | null;
  isReady: boolean;
  error: SpotifyError | null;
  isPlaying: boolean;
  currentTrack: {
    name: string;
    artists: string[];
    albumArt: string;
  } | null;
  position: number;
  duration: number;
  volume: number;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export function SpotifyPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<SpotifyError | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    artists: string[];
    albumArt: string;
  } | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const playerRef = useRef<SpotifyPlayer | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    let script: HTMLScriptElement | null = null;

    if (!window.Spotify) {
      script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!window.Spotify) return;
      const playerInstance = new window.Spotify.Player({
        name: 'Playlist Companion Player',
        getOAuthToken: (cb: (token: string) => void) => { cb(session.accessToken as string); },
        volume: 0.5,
      });
      playerRef.current = playerInstance;
      setPlayer(playerInstance);

      playerInstance.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      playerInstance.addListener('not_ready', () => {
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError('Player not ready'));
      });

      playerInstance.addListener('initialization_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Initialization error: ${message}`));
      });

      playerInstance.addListener('authentication_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Authentication error: ${message}`, 401));
      });

      playerInstance.addListener('account_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Account error: ${message}`));
      });

      playerInstance.addListener('playback_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Playback error: ${message}`));
      });

      playerInstance.addListener('player_state_changed', (state: SpotifyPlayerState) => {
        if (!state) {
          setIsPlaying(false);
          setCurrentTrack(null);
          setPosition(0);
          setDuration(0);
          return;
        }

        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        setVolumeState(state.volume);
        if (state.track_window?.current_track) {
          const track = state.track_window.current_track;
          setCurrentTrack({
            name: track.name,
            artists: track.artists.map(a => a.name),
            albumArt: track.album.images[0]?.url || '/track-placeholder.png',
          });
        }
      });

      playerInstance.connect();
    };

    return () => {
      if (script) script.remove();
      if (playerRef.current) playerRef.current.disconnect();
    };
  }, [session?.accessToken]);

  const play = async (uri: string) => {
    if (!deviceId || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await playerRef.current?.activateElement();
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [uri] }),
      });
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to play track');
    }
  };

  const pause = async () => {
    if (!deviceId || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to pause playback');
    }
  };

  const resume = async () => {
    if (!deviceId || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to resume playback');
    }
  };

  const togglePlay = async () => {
    if (!playerRef.current || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await playerRef.current.togglePlay();
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to toggle playback');
    }
  };

  const nextTrack = async () => {
    if (!playerRef.current || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await playerRef.current.nextTrack();
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to skip to next track');
    }
  };

  const previousTrack = async () => {
    if (!playerRef.current || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await playerRef.current.previousTrack();
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to go to previous track');
    }
  };

  const seek = async (position_ms: number) => {
    if (!playerRef.current || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await playerRef.current.seek(position_ms);
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to seek');
    }
  };

  const setVolume = async (volume: number) => {
    if (!playerRef.current || !isReady) {
      throw new SpotifyError('Player not ready');
    }
    try {
      await playerRef.current.setVolume(volume);
    } catch (error) {
      if (error instanceof SpotifyError) {
        throw error;
      }
      throw new SpotifyError('Failed to set volume');
    }
  };

  const value = {
    player,
    deviceId,
    isReady,
    error,
    isPlaying,
    currentTrack,
    position,
    duration,
    volume,
    play,
    pause,
    resume,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayer() {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx) throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
  return ctx;
} 