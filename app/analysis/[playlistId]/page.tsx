import { PageLayout } from '@/app/components/layout/PageLayout';
import { Button } from '@/app/components/ui/Button';

export default function AnalysisPage({ params }: { params: { playlistId: string } }) {
  // Placeholder data for tracks
  const tracks = [
    { 
      id: '1', 
      name: 'Bohemian Rhapsody', 
      artist: 'Queen', 
      duration: '5:55',
      imageUrl: 'https://via.placeholder.com/100',
      analysis: 'This iconic rock opera was released in 1975 and is considered one of the greatest songs ever recorded. It combines elements of rock, opera, and ballad styles, showcasing Queen\'s innovative approach to music composition.'
    },
    { 
      id: '2', 
      name: 'Billie Jean', 
      artist: 'Michael Jackson', 
      duration: '4:54',
      imageUrl: 'https://via.placeholder.com/100',
      analysis: 'Released in 1983 as part of the Thriller album, this song features Jackson\'s signature dance moves and innovative production techniques. The bassline is one of the most recognizable in pop music history.'
    },
    { 
      id: '3', 
      name: 'Sweet Child O\' Mine', 
      artist: 'Guns N\' Roses', 
      duration: '5:56',
      imageUrl: 'https://via.placeholder.com/100',
      analysis: 'This power ballad was released in 1987 and features one of the most famous guitar riffs in rock history. The song was written about lead singer Axl Rose\'s then-girlfriend Erin Everly.'
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Playlist Analysis</h1>
            <p className="text-secondary">Analyzing tracks with AI insights</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary">Change Prompt</Button>
            <Button>Save Analysis</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="font-medium mb-2">Current Prompt</h2>
          <p className="text-secondary">Tell me about the history behind each track</p>
        </div>

        <div className="space-y-6">
          {tracks.map((track) => (
            <div 
              key={track.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="flex p-4">
                <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={track.imageUrl} 
                    alt={track.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{track.name}</h3>
                      <p className="text-secondary">{track.artist} • {track.duration}</p>
                    </div>
                    <Button variant="secondary" size="sm">Regenerate</Button>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm">{track.analysis}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 