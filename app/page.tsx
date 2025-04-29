import { PageLayout } from '@/app/components/layout/PageLayout';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <PageLayout showFooter={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Playlist Companion
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Connect your Spotify playlist and get educational insights about each track.
            Learn the history, context, and interesting facts about your favorite music.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Link href="/playlists">
            <Button size="lg">
              Connect with Spotify
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>Select a playlist and enter a prompt to get started</p>
        </div>
      </div>
    </PageLayout>
  );
}
