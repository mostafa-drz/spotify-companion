import type { SpotifyTrack } from '@/app/types/Spotify';

interface NowPlayingTrackInfoProps {
  track: SpotifyTrack;
  position: number;
  duration: number;
  isPlaying: boolean;
}

function msToTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function NowPlayingTrackInfo({ track, position, duration }: NowPlayingTrackInfoProps) {
  const progressPercent = typeof duration === 'number' && duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <img
          src={track.album.images[0]?.url || "/track-placeholder.png"}
          alt={track.album.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shadow border border-gray-200 dark:border-gray-700 object-cover mb-4 sm:mb-0"
        />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2 leading-tight whitespace-normal break-words">{track.name}</h2>
          <div className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-1 whitespace-normal break-words">{track.artists.map(a => a.name).join(", ")}</div>
          <div className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mb-2 whitespace-normal break-words">{track.album.name}</div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 break-words">Track ID: {track.id ?? '—'}</div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 break-words">Playable: {track.is_playable ? 'Yes' : 'No'}</div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 break-words">Type: {track.type} ({track.media_type})</div>
        </div>
      </div>
      <div className="mb-4">
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
    </div>
  );
}
