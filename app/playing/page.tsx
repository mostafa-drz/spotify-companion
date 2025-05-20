"use client";

import { useSession } from "next-auth/react";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useState, useEffect, useRef } from "react";
import type { SpotifyTrack } from "@/app/types/Spotify";
import { clientDb } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";


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
  const [introsEnabled, setIntrosEnabled] = useState(true);
  const [introStatus, setIntroStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [introScript, setIntroScript] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);

  // Effect: Generate intro script on track change if enabled
  useEffect(() => {
    const userId = session?.user?.id;
    const track = currentTrack as SpotifyTrack;

    async function getIntroFromDb() {
      if (!userId || !track?.id) return null;
      const introDoc = await getDoc(doc(clientDb, 'users', userId, 'trackIntros', track.id));
      return introDoc.exists() ? introDoc.data()?.introText : null;
    }

    function generateIntro() {
      if (!userId || !track?.id) return;
      
      setIntroStatus('generating');
      setIntroScript(null);
      setIntroError(null);
      
      fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          track: {
            ...track,
          },
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.status === 'ready') {
            setIntroScript(data.intro.introText);
            setIntroStatus('ready');
            lastTrackIdRef.current = track.id;
          } else {
            setIntroStatus('error');
            setIntroError(data.error || 'Failed to generate intro.');
          }
        })
        .catch((err) => {
          setIntroStatus('error');
          setIntroError(err?.message || 'Failed to generate intro.');
        });
    }

    async function updateIntro() {
      const intro = await getIntroFromDb();
      if (intro) {
        setIntroScript(intro);
        setIntroStatus('ready');
      } else {
        generateIntro();
      }
    }

    if (introsEnabled && userId && track && track.id && track.is_playable && track.id !== lastTrackIdRef.current) {
      updateIntro();
    }

    if (!introsEnabled || !track?.is_playable) {
      setIntroStatus('idle');
      setIntroScript(null);
      setIntroError(null);
      lastTrackIdRef.current = null;
    }

  }, [introsEnabled, currentTrack, session?.user?.id]);

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
      {/* Intros toggle */}
      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center cursor-pointer gap-2">
          <input
            type="checkbox"
            checked={introsEnabled}
            onChange={e => setIntrosEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-primary"
            aria-label="Enable AI intros for now playing"
          />
          <span className="text-base font-medium text-foreground">Enable AI Intros for Now Playing</span>
        </label>
      </div>
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
      {/* Intro script status and display */}
      <div className="mt-8">
        {introStatus === 'generating' && <div className="text-neutral">Generating intro...</div>}
        {introStatus === 'ready' && introScript && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-foreground text-base shadow-inner">
            <span className="font-semibold text-primary">Intro:</span> {introScript}
          </div>
        )}
        {introStatus === 'error' && (
          <div className="text-semantic-error">{introError}</div>
        )}
      </div>
    </div>
  );
}

function msToTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
} 