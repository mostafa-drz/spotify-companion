import { PageLayout } from '@/app/components/layout/PageLayout';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';

export default function PlaylistsPage() {
  // Placeholder data for playlists
  const playlists = [
    { id: '1', name: 'Workout Mix', trackCount: 25, imageUrl: 'https://via.placeholder.com/150' },
    { id: '2', name: 'Chill Vibes', trackCount: 18, imageUrl: 'https://via.placeholder.com/150' },
    { id: '3', name: 'Party Time', trackCount: 32, imageUrl: 'https://via.placeholder.com/150' },
    { id: '4', name: 'Study Focus', trackCount: 15, imageUrl: 'https://via.placeholder.com/150' },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Playlists</h1>
          <Button variant="secondary">Refresh Playlists</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-200">
                <img 
                  src={playlist.imageUrl} 
                  alt={playlist.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg">{playlist.name}</h3>
                <p className="text-secondary text-sm">{playlist.trackCount} tracks</p>
                <Link href={`/playlists/${playlist.id}/analysis`}>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="mt-3 w-full"
                  >
                    Analyze Playlist
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 