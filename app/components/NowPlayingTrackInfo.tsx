import type { SpotifyTrack } from '@/app/types/Spotify';
import ProgressBar from './ui/ProgressBar';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/solid';

interface NowPlayingTrackInfoProps {
  track: SpotifyTrack;
  position: number;
  duration: number;
  isPlaying: boolean;
  error?: string | null;
  isReady?: boolean;
  deviceId?: string | null;
  onTransferPlayback?: (play: boolean) => Promise<void>;
  transferring?: boolean;
  transferError?: string | null;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  controlsDisabled?: boolean;
}

function msToTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function NowPlayingTrackInfo({
  track,
  position,
  duration,
  isPlaying,
  error,
  transferError,
  onPlayPause,
  onNext,
  onPrev,
  controlsDisabled,
}: NowPlayingTrackInfoProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.album.images[0]?.url || '/track-placeholder.png'}
          alt={track.album.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shadow border border-gray-200 dark:border-gray-700 object-cover mb-4 sm:mb-0"
        />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2 leading-tight whitespace-normal break-words">
            {track.name}
          </h2>
          <div className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-1 whitespace-normal break-words">
            {track.artists.map((a) => a.name).join(', ')}
          </div>
          <div className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mb-2 whitespace-normal break-words">
            {track.album.name}
          </div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 break-words">
            Track ID: {track.id ?? '—'}
          </div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 break-words">
            Playable: {track.is_playable ? 'Yes' : 'No'}
          </div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 break-words">
            Type: {track.type} ({track.media_type})
          </div>
          {error && (
            <div className="text-xs text-red-500 mt-2" role="alert">
              {error}
            </div>
          )}
          {transferError && (
            <div className="text-xs text-red-500 mt-2" role="alert">
              {transferError}
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <ProgressBar value={position} max={duration} isPlaying={isPlaying} />
        <div className="flex justify-between text-xs text-neutral mt-1">
          <span>{msToTime(position)}</span>
          <span>{msToTime(duration)}</span>
        </div>
      </div>
      {/* Minimal Player Controls */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <button
          onClick={onPrev}
          aria-label="Previous track"
          disabled={controlsDisabled}
          className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
        >
          <BackwardIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={controlsDisabled}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isPlaying ? (
            <PauseIcon className="w-7 h-7" />
          ) : (
            <PlayIcon className="w-7 h-7" />
          )}
        </button>
        <button
          onClick={onNext}
          aria-label="Next track"
          disabled={controlsDisabled}
          className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
        >
          <ForwardIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
