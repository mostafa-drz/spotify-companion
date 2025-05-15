import Link from 'next/link';
import type { SpotifyPlaylist } from '@/app/lib/spotify';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const imageUrl = playlist.images?.[0]?.url || '/playlist-placeholder.png';
  
  return (
    <Link 
      href={`/playlists/${playlist.id}`}
      className="playlist-card hover-lift"
    >
      <div className="relative aspect-square mb-3">
        <img
          src={imageUrl}
          alt={playlist.name}
          className="object-cover rounded-lg"
          width={100}
          height={100}
        />
      </div>
      
      <h3 className="font-semibold text-lg mb-1 line-clamp-1">
        {playlist.name}
      </h3>
      
      {playlist.description && (
        <p className="text-neutral text-sm line-clamp-2">
          {playlist.description}
        </p>
      )}
      
      <div className="mt-2 text-sm text-neutral-light">
        {playlist.tracks.total} tracks
      </div>
    </Link>
  );
} 