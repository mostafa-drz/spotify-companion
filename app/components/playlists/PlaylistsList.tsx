import { getCurrentUserPlaylists } from '@/app/lib/spotify';
import { PlaylistCard } from '@/app/components/playlists/PlaylistCard';

export async function PlaylistsList() {
  try {
      const playlists = await getCurrentUserPlaylists();

    if (!playlists.items.length) {
      return (
        <div className="p-4 text-neutral">
          No playlists found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.items.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 text-semantic-error">
        Error: {error instanceof Error ? error.message : 'Failed to load playlists'}
      </div>
    );
  }
} 