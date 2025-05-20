'use client';

import { useEffect, useState } from 'react';
import { useSpotifyPlayer } from '@/app/contexts/SpotifyPlayerContext';
import { WebPlaybackPlayer, WebPlaybackState, SpotifyArtist } from '@/app/types/Spotify';

const DEFAULT_ALBUM_ART = '/track-placeholder.png';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: { Player: WebPlaybackPlayer };
  }
}

export default function SpotifyWebPlayer() {
  const { player, deviceId, isReady } = useSpotifyPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState<{
    title: string;
    artist: string;
    albumArt: string;
  } | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Format ms to mm:ss
  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!player) return;
    // Listen for player state changes
    const stateListener = (state: WebPlaybackState) => {
      if (!state || !state.track_window.current_track) {
        setTrack(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
        return;
      }
      setIsPlaying(!state.paused);
      const t = state.track_window.current_track;
      setTrack({
        title: t.name,
        artist: t.artists.map((a: SpotifyArtist) => a.name).join(', '),
        albumArt: t.album.images[0]?.url || DEFAULT_ALBUM_ART,
      });
    };
    player.addListener('player_state_changed', stateListener);
    return () => {
      player.removeListener('player_state_changed', stateListener);
    };
  }, [player]);

  // --- Control Handlers ---
  const handlePlayPause = async () => {
    if (player) {
      await player.togglePlay();
    }
  };
  const handleNext = async () => {
    if (player) {
      await player.nextTrack();
    }
  };
  const handlePrevious = async () => {
    if (player) {
      await player.previousTrack();
    }
  };

  const handleSeek = async (ms: number) => {
    setPosition(ms);
    if (player) {
      await player.seek(ms);
    }
  };

  if (!isReady) return <div className="text-neutral">Spotify player is loading...</div>;
  if (!deviceId) return <div className="text-semantic-error">Spotify player not ready.</div>;

  return (
    <div className="music-card max-w-xl mx-auto mt-8 flex flex-col items-center">
      {/* Track Info */}
      {track ? (
        <div className="flex items-center gap-4 mb-4 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.albumArt}
            alt={track.title ? `${track.title} album art` : 'Album art'}
            className="w-16 h-16 rounded-xl shadow"
            width={64}
            height={64}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate" title={track.title}>{track.title}</h3>
            <p className="text-neutral truncate" title={track.artist}>{track.artist}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-4 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEFAULT_ALBUM_ART}
            alt="No track playing"
            className="w-16 h-16 rounded-xl shadow"
            width={64}
            height={64}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate text-neutral">No track playing</h3>
            <p className="text-neutral truncate">—</p>
          </div>
        </div>
      )}
      {/* Progress Bar */}
      <div className="flex items-center gap-2 w-full mb-2">
        <span className="text-xs text-neutral min-w-[2.5rem] text-right">{formatTime(position)}</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={isSeeking ? undefined : position}
          onChange={e => {
            setIsSeeking(true);
            setPosition(Number(e.target.value));
          }}
          onMouseUp={e => {
            setIsSeeking(false);
            handleSeek(Number((e.target as HTMLInputElement).value));
          }}
          onTouchEnd={e => {
            setIsSeeking(false);
            handleSeek(Number((e.target as HTMLInputElement).value));
          }}
          className="input-primary w-full max-w-xs"
          aria-label="Seek"
        />
        <span className="text-xs text-neutral min-w-[2.5rem] text-left">{formatTime(duration)}</span>
      </div>
      {/* Controls */}
      <div className="flex items-center justify-center gap-6 w-full mb-4">
        <button className="btn-ghost" aria-label="Previous" onClick={handlePrevious}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4v16h2V4H6zm3.5 8l8.5 6V6l-8.5 6z" /></svg>
        </button>
        <button className="btn-primary" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handlePlayPause}>
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button className="btn-ghost" aria-label="Next" onClick={handleNext}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 20V4h-2v16h2zm-3.5-8L6 6v12l8.5-6z" /></svg>
        </button>
      </div>
      {/* Volume */}
      <div className="flex items-center gap-2 w-full">
        <svg className="w-5 h-5 text-neutral" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          className="input-primary w-full max-w-xs"
          aria-label="Volume"
        />
      </div>
      {/* Player status */}
      <div className="mt-4 text-sm text-neutral">
        {isReady ? (
          <span>Spotify Web Player is ready! Device ID: <span className="font-mono">{deviceId}</span></span>
        ) : (
          <span>Loading Spotify Web Player...</span>
        )}
      </div>
    </div>
  );
}

// --- Remaining Tasks ---
// 4. Clean Up Old Code 