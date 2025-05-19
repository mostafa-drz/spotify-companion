import { getPlaylist, getPlaylistTracks } from '@/app/lib/spotify';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { TrackListItem } from '@/app/types/TrackListItem';
import TracksListClient from './TracksListClient';
import PlaylistSettingsInlineClient from '@/app/components/playlists/PlaylistSettingsInlineClient';

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const playlistId = params.id;
  try {
    const [playlist, tracks] = await Promise.all([
      getPlaylist(playlistId),
      getPlaylistTracks(playlistId)
    ]);

    const formattedTracks: TrackListItem[] = tracks.items.map((item: { track: { id: string; name: string; uri: string; artists: { name: string }[]; album: { name: string; images: { url: string }[] }; duration_ms: number } }) => ({
      id: item.track.id,
      name: item.track.name,
      uri: item.track.uri,
      artists: item.track.artists.map((a: { name: string }) => a.name).join(', '),
      album: item.track.album.name,
      duration: item.track.duration_ms,
      imageUrl: item.track.album.images[2]?.url || item.track.album.images[0]?.url || '/track-placeholder.png',
    }));

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          {/* Playlist Header */}
          <div className="flex gap-8 mb-8">
            <img 
              src={playlist.images[0]?.url} 
              alt={playlist.name}
              className="w-48 h-48 object-cover rounded-lg shadow-lg"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-foreground-secondary mb-4">
                  {playlist.description}
                </p>
              )}
              <p className="text-foreground-secondary">
                By {playlist.owner.display_name} • {playlist.tracks.total} tracks
              </p>
            </div>
          </div>

          {/* Inline Playlist Settings */}
          <PlaylistSettingsInlineClient playlistId={playlistId} />

          {/* Tracks List */}
          <Suspense fallback={<div>Loading tracks...</div>}>
            <TracksListClient tracks={formattedTracks} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading playlist:', error);
    notFound();
  }
} 