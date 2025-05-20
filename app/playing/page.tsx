"use client";

import { useSession } from "next-auth/react";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useState } from "react";
import type { SpotifyTrack } from "@/app/types/Spotify";

export default function NowPlayingPage() {
  const { data: session, status } = useSession();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    error: playerError,
    isReady,
    deviceId,
    transferPlayback,
  } = useSpotifyPlayer();
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="p-8 text-neutral">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-8 text-semantic-error text-center">
        Please log in with Spotify to use the Now Playing companion.
      </div>
    );
  }

  if (playerError) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-semantic-error text-center">
        {playerError.message}
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Spotify Player is loading...</h2>
        <p>Waiting for the Spotify Web Playback SDK to connect.</p>
      </div>
    );
  }

  // If SDK is ready but no track, offer transfer playback
  if (!currentTrack && deviceId && session.accessToken) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Playback is on another device</h2>
        <p className="mb-4">To enable AI intros and real-time controls, playback needs to happen in this browser tab.</p>
        <button
          className="btn btn-primary px-6 py-2 rounded font-semibold disabled:opacity-60"
          disabled={transferring}
          onClick={async () => {
            setTransferring(true);
            setTransferError(null);
            try {
              await transferPlayback(true);
            } catch (err) {
              setTransferError((err as Error).message || "Failed to transfer playback.");
            } finally {
              setTransferring(false);
            }
          }}
        >
          {transferring ? "Transferring..." : "Play in this browser"}
        </button>
        {transferError && <div className="text-semantic-error mt-2">{transferError}</div>}
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Nothing is playing</h2>
        <p>Start playing a track on Spotify to see the now playing companion.</p>
      </div>
    );
  }

  // Progress bar width
  const progressPercent = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  const track = currentTrack as SpotifyTrack;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818]">
      <div className="flex items-center gap-6">
        <img
          src={track.album.images[0]?.url || "/track-placeholder.png"}
          alt={track.album.name}
          className="w-28 h-28 rounded-lg shadow border border-gray-200 dark:border-gray-700 object-cover"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-primary truncate mb-1">{track.name}</h2>
          <div className="text-neutral text-base truncate mb-1">{track.artists.map(a => a.name).join(", ")}</div>
          <div className="text-neutral text-sm truncate">{track.album.name}</div>
          <div className="text-xs text-neutral mt-2">Track ID: {track.id ?? '—'}</div>
          <div className="text-xs text-neutral">Playable: {track.is_playable ? 'Yes' : 'No'}</div>
          <div className="text-xs text-neutral">Type: {track.type} ({track.media_type})</div>
        </div>
      </div>
      <div className="mt-6">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-2 bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral mt-1">
          <span>{msToTime(position)}</span>
          <span>{msToTime(duration)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className={`text-sm font-medium ${isPlaying ? 'text-primary' : 'text-neutral'}`}>{isPlaying ? 'Playing' : 'Paused'}</span>
      </div>
    </div>
  );
}

function msToTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
} 