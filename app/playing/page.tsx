'use client';

import { useSession } from 'next-auth/react';
import { useSpotifyPlayer } from '@/app/contexts/SpotifyPlayerContext';
import { useState, useEffect, useRef } from 'react';
import type { SpotifyTrack } from '@/app/types/Spotify';
import type { PromptTemplate } from '@/app/types/Prompt';
import { useUserTemplates } from '@/app/lib/hooks/useUserTemplates';
import NowPlayingTrackInfo from '@/app/components/NowPlayingTrackInfo';
import IntroControls from '@/app/components/IntroControls';
import TemplateSelector from '@/app/components/TemplateSelector';
import LowCreditBanner from '@/app/components/LowCreditBanner';
import { useTrackIntro } from '@/app/lib/hooks/useTrackIntro';
import { useAutoIntroOrchestration } from '@/app/lib/hooks/useAutoIntroOrchestration';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    spotifyPlayer?: {
      pause: () => void;
      resume: () => void;
    };
  }
}

export default function NowPlayingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    currentTrack,
    position,
    isPlaying,
    isReady,
    error,
    togglePlay,
    nextTrack,
    previousTrack,
    transferPlayback,
  } = useSpotifyPlayer();
  const [transferring, setTransferring] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    PromptTemplate | undefined
  >(undefined);
  const { templates: userTemplates = [] } = useUserTemplates();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackId = currentTrack?.id || undefined;
  const templateId = selectedTemplate?.id || undefined;
  const { intro: currentIntro } = useTrackIntro(trackId, templateId);
  const [introsEnabled, setIntrosEnabled] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Integrate auto-intro orchestration
  useAutoIntroOrchestration({
    introsEnabled,
    currentTrack: currentTrack ? (currentTrack as SpotifyTrack) : undefined,
    selectedTemplate,
    currentIntro,
    audioRef,
    isPlaying,
    togglePlay,
  });

  // Fallback for duration if not in context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const duration = (currentTrack as any)?.duration_ms ?? 0;

  if (status === 'loading') {
    return <div className="p-8 text-neutral">Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect due to useEffect
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-semantic-error text-center">
        {error.message}
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">
          Spotify Player is loading...
        </h2>
        <p>Waiting for the Spotify Web Playback SDK to connect.</p>
      </div>
    );
  }

  // If SDK is ready but no track, offer transfer playback
  if (!currentTrack && session.accessToken) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">
          Playback is on another device
        </h2>
        <p className="mb-4">
          To enable AI intros and real-time controls, playback needs to happen
          in this browser tab.
        </p>
        <button
          className="btn btn-primary px-6 py-2 rounded font-semibold disabled:opacity-60"
          disabled={transferring}
          onClick={async () => {
            setTransferring(true);
            try {
              await transferPlayback(true);
            } catch {
              // Optionally handle error
            } finally {
              setTransferring(false);
            }
          }}
        >
          {transferring ? 'Transferring...' : 'Play in this browser'}
        </button>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Nothing is playing</h2>
        <p>
          Start playing a track on Spotify to see the now playing companion.
        </p>
      </div>
    );
  }

  const track = currentTrack as SpotifyTrack;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <LowCreditBanner />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Now Playing</h1>
        </div>

        {/* Top section: always full width with a max, centered */}
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
          <TemplateSelector
            onSelect={setSelectedTemplate}
            selectedTemplate={selectedTemplate}
            templates={userTemplates}
          />
          <IntroControls
            introsEnabled={introsEnabled}
            setIntrosEnabled={setIntrosEnabled}
            selectedTemplate={selectedTemplate}
            currentTrack={track}
            audioRef={audioRef}
            onSkip={togglePlay}
            onPauseSpotify={() => {
              if (isPlaying) {
                togglePlay();
              }
            }}
          />
        </div>
        {/* Content section: full width, left-aligned */}
        <div className="mt-8">
          <NowPlayingTrackInfo
            track={track}
            position={position}
            duration={duration}
            isPlaying={isPlaying}
            error={typeof error === 'string' ? error : undefined}
            isReady={isReady}
            onTransferPlayback={transferPlayback}
            onPlayPause={togglePlay}
            onNext={nextTrack}
            onPrev={previousTrack}
            controlsDisabled={!isReady || !!error}
          />
        </div>
      </div>
      {/* Hidden audio element for playback logic */}
      <audio
        ref={audioRef}
        src={currentIntro?.audioUrl || undefined}
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  );
}
