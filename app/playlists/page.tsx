import { PlaylistsList } from '@/app/components/playlists/PlaylistsList';

export const metadata = {
  title: 'My Playlists | Playlist Companion',
  description: 'View and manage your Spotify playlists',
};

export default function PlaylistsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Playlists</h1>
        <p className="text-neutral">
          Select a playlist to view its tracks and get educational insights
        </p>
      </div>

      <PlaylistsList />
    </div>
  );
} 