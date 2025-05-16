'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SpotifyWebPlayer() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.accessToken) return;

    // Load the Spotify Web Playback SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Playlist Companion Player',
        getOAuthToken: cb => { cb(session.accessToken as string); },
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setPlayerReady(true);
        console.log('Ready with Device ID', device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        setPlayerReady(false);
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }) => {
        setError(message);
      });
      player.addListener('authentication_error', ({ message }) => {
        setError(message);
      });
      player.addListener('account_error', ({ message }) => {
        setError(message);
      });
      player.addListener('playback_error', ({ message }) => {
        setError(message);
      });

      player.connect();
    };

    return () => {
      // Clean up script and player
      script.remove();
    };
  }, [session?.accessToken]);

  if (error) return <div className="text-red-500">Spotify Player Error: {error}</div>;
  if (!session?.accessToken) return <div>Please sign in with Spotify.</div>;

  return (
    <div className="p-4 bg-background-secondary rounded shadow mt-4">
      {playerReady ? (
        <div>Spotify Web Player is ready! Device ID: <span className="font-mono">{deviceId}</span></div>
      ) : (
        <div>Loading Spotify Web Player...</div>
      )}
    </div>
  );
} 