export default function Home() {
  return (
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
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => {/* TODO: Implement Spotify login */}}
        >
          Connect with Spotify
        </button>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>Select a playlist and enter a prompt to get started</p>
      </div>
    </div>
  );
}
