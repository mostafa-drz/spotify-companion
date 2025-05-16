'use client';

import { useSession } from 'next-auth/react';
import { useSpotifyPlayer } from '@/app/contexts/SpotifyPlayerContext';
import type { TrackListItem } from '@/app/types/TrackListItem';

function msToTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function TracksListClient({ tracks }: { tracks: TrackListItem[] }) {
  const { data: session } = useSession();
  const { deviceId, isReady } = useSpotifyPlayer();

  const handlePlay = async (uri: string) => {
    if (!session?.accessToken || !deviceId || !isReady) {
      alert('Spotify player not ready.');
      return;
    }
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });
  };

  return (
    <div className="space-y-2">
      {tracks.map((track, idx) => (
        <div key={track.id} className="flex items-center space-x-4 p-4 bg-background-secondary rounded-lg group">
          <span className="text-neutral w-8">{idx + 1}</span>
          <img src={track.imageUrl} alt={track.name} className="w-12 h-12 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-medium truncate">{track.name}</h3>
            <p className="text-foreground-secondary text-sm truncate">{track.artists}</p>
          </div>
          <div className="text-foreground-secondary text-sm w-12 text-right">{msToTime(track.duration)}</div>
          <button
            className="btn-primary ml-4 disabled:opacity-50"
            onClick={() => handlePlay(track.uri)}
            aria-label={`Play ${track.name}`}
            disabled={!isReady || !deviceId}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
} 