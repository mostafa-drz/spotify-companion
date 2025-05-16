'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SpotifyPlayerContextType {
  player: any; // Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export function SpotifyPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<any>(null); // Spotify.Player | null
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null); // Spotify.Player | null

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
      });
      playerInstance.addListener('not_ready', () => {
        setIsReady(false);
        setDeviceId(null);
      });
      playerInstance.addListener('initialization_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        console.error('Spotify SDK initialization error:', message);
      });
      playerInstance.addListener('authentication_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        console.error('Spotify SDK authentication error:', message);
      });
      playerInstance.addListener('account_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        console.error('Spotify SDK account error:', message);
      });
      playerInstance.addListener('playback_error', ({ message }: { message: string }) => {
        setIsReady(false);
        setDeviceId(null);
        console.error('Spotify SDK playback error:', message);
      });
      playerInstance.connect();
    };

    return () => {
      if (script) script.remove();
      if (playerRef.current) playerRef.current.disconnect();
    };
  }, [session?.accessToken]);

  return (
    <SpotifyPlayerContext.Provider value={{ player, deviceId, isReady }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayer() {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx) throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
  return ctx;
} 