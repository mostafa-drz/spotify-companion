'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import type {
  WebPlaybackTrack,
  WebPlaybackState,
  SpotifyPlayer,
} from '@/app/types/Spotify';

// If you want to centralize SpotifyError and SpotifyPlayerContextType, import them here as well
// import { SpotifyError, SpotifyPlayerContextType } from '@/app/types/Spotify';

class SpotifyError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SpotifyError';
  }
}

interface SpotifyPlayerContextType {
  player: SpotifyPlayer | null;
  deviceId: string | null;
  isReady: boolean;
  error: SpotifyError | null;
  isPlaying: boolean;
  currentTrack: WebPlaybackTrack | null;
  position: number;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  transferPlayback: (play: boolean) => Promise<void>;
}

const SpotifyPlayerContext = createContext<
  SpotifyPlayerContextType | undefined
>(undefined);

// Local extension for activateElement (not in SDK type)
interface LocalSpotifyPlayer extends SpotifyPlayer {
  activateElement: () => Promise<void>;
}

interface WindowWithSpotify extends Window {
  Spotify?: {
    Player: new (config: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }) => LocalSpotifyPlayer;
  };
  onSpotifyWebPlaybackSDKReady?: () => void;
}

export function SpotifyPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<SpotifyError | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<WebPlaybackTrack | null>(
    null
  );
  const [position, setPosition] = useState(0);
  const playerRef = useRef<LocalSpotifyPlayer | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    let script: HTMLScriptElement | null = null;
    const w = window as WindowWithSpotify;

    if (!w.Spotify) {
      script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    w.onSpotifyWebPlaybackSDKReady = () => {
      if (!w.Spotify) return;
      const playerInstance = new w.Spotify.Player({
        name: 'Spotify Companion Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(session.accessToken as string);
        },
        volume: 0.5,
      });
      playerRef.current = playerInstance;
      setPlayer(playerInstance);

      playerInstance.addListener('ready', (payload: unknown) => {
        const { device_id } = payload as { device_id: string };
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      playerInstance.addListener('not_ready', () => {
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError('Player not ready'));
      });

      playerInstance.addListener('initialization_error', (payload: unknown) => {
        const { message } = payload as { message: string };
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Initialization error: ${message}`));
      });

      playerInstance.addListener('authentication_error', (payload: unknown) => {
        const { message } = payload as { message: string };
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Authentication error: ${message}`, 401));
      });

      playerInstance.addListener('account_error', (payload: unknown) => {
        const { message } = payload as { message: string };
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Account error: ${message}`));
      });

      playerInstance.addListener('playback_error', (payload: unknown) => {
        const { message } = payload as { message: string };
        setIsReady(false);
        setDeviceId(null);
        setError(new SpotifyError(`Playback error: ${message}`));
      });

      playerInstance.addListener('player_state_changed', (payload: unknown) => {
        const state = payload as WebPlaybackState | null;
        if (!state) {
          setIsPlaying(false);
          setCurrentTrack(null);
          setPosition(0);
          return;
        }
        setIsPlaying(!state.paused);
        setPosition(state.position);
        if (state.track_window?.current_track) {
          setCurrentTrack(state.track_window.current_track as WebPlaybackTrack);
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
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        }
      );
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
      await fetch(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
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
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
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

  // Transfer playback to this device
  const transferPlayback = async (play: boolean = true): Promise<void> => {
    if (!deviceId || !session?.accessToken)
      throw new SpotifyError('No device or access token');
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play,
        }),
      });
      if (!res.ok) {
        throw new SpotifyError('Failed to transfer playback');
      }
    } catch (err) {
      throw new SpotifyError(
        (err as Error).message || 'Failed to transfer playback'
      );
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
    play,
    pause,
    resume,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    transferPlayback,
  };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayer() {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx)
    throw new Error(
      'useSpotifyPlayer must be used within SpotifyPlayerProvider'
    );
  return ctx;
}
