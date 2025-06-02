"use client";

import { useSession } from "next-auth/react";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useState, useEffect, useRef } from "react";
import type { SpotifyTrack } from "@/app/types/Spotify";
import type { TrackIntro } from '@/app/types/Prompt';
import type { PromptTemplate } from '@/app/types/Prompt';
import { useTrackIntros } from '@/app/lib/hooks/useTrackIntros';
import { useLowCredits } from '@/app/lib/hooks/useLowCredits';
import { useGenerateIntro } from '@/app/lib/hooks/useGenerateIntro';
import { useUserTemplates } from '@/app/lib/hooks/useUserTemplates';
import NowPlayingTrackInfo from '@/app/components/NowPlayingTrackInfo';
import IntroControls from '@/app/components/IntroControls';
import TemplateSelector from '@/app/components/TemplateSelector';
import CreditBalance from '@/app/components/CreditBalance';
import LowCreditBanner from '@/app/components/LowCreditBanner';

declare global {
  interface Window {
    spotifyPlayer?: {
      pause: () => void;
      resume: () => void;
    };
  }
}

type IntroStatus = 'idle' | 'generating' | 'ready' | 'error';

const DEFAULT_TEMPLATE: PromptTemplate = {
  id: '',
  name: 'Default Template',
  prompt: 'Tell me something interesting about this track.',
  isSystem: false,
  createdAt: '',
  updatedAt: '',
};

export default function NowPlayingPage() {
  const { data: session, status } = useSession();
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
  const [introsEnabled, setIntrosEnabled] = useState(true);
  const [introStatus, setIntroStatus] = useState<IntroStatus>('idle');
  const [introScript, setIntroScript] = useState<TrackIntro | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState(false);
  const lastTrackIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isIntroAudioPlaying, setIsIntroAudioPlaying] = useState(false);
  const [wasSpotifyPlaying, setWasSpotifyPlaying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | undefined>(undefined);
  const { templates: userTemplates = [], isLoading: templatesLoading, error: templatesError } = useUserTemplates(session?.user?.id);

  // Use SWR hook for track intros
  const {
    trackIntros,
    mutate: mutateTrackIntros
  } = useTrackIntros(session?.user?.id, currentTrack?.id || undefined);

  // Use SWR hook for low credit status
  const {
    isLow: showLowCreditBanner
  } = useLowCredits(session?.user?.id);

  // Use SWR hook for generating intros
  const { generateIntro } = useGenerateIntro();

  // Fallback for duration if not in context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const duration = (currentTrack as any)?.duration_ms ?? 0;

  // Effect: Set default template if not set
  useEffect(() => {
    if (!selectedTemplate && currentTrack?.id !== lastTrackIdRef.current) {
      setSelectedTemplate(DEFAULT_TEMPLATE);
    }
  }, [selectedTemplate, currentTrack?.id]);

  // Effect: Generate intro script on track or template change if enabled
  useEffect(() => {
    const userId = session?.user?.id;
    const track = currentTrack as SpotifyTrack;
    const intro = trackIntros.find(i => i.templateId === selectedTemplate?.id);

    if (introsEnabled && userId && track && track.id && track.is_playable && selectedTemplate?.id) {
      if (intro) {
        setIntroScript(intro);
        setIntroStatus('ready');
      } else {
        setIntroStatus('generating');
        setIntroScript(null);
        setIntroError(null);
        setIntroSuccess(false);
        generateIntro({
          userId: userId!,
          trackId: track.id!,
          track: { ...track },
          templateId: selectedTemplate!.id,
          templateName: selectedTemplate!.name,
          language: 'en',
          tone: 'conversational',
          length: 60,
          userAreaOfInterest: selectedTemplate!.prompt
        })
          .then(async (result) => {
            setIntroScript(result);
            setIntroStatus('ready');
            lastTrackIdRef.current = track.id;
            mutateTrackIntros();
          })
          .catch((err) => {
            setIntroStatus('error');
            setIntroError(err instanceof Error ? err.message : 'Failed to generate intro.');
          });
      }
    }

    if (!introsEnabled || !track?.is_playable) {
      setIntroStatus('idle');
      setIntroScript(null);
      setIntroError(null);
      lastTrackIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introsEnabled, currentTrack, session?.user?.id, selectedTemplate?.id, selectedTemplate?.prompt, selectedTemplate?.name, generateIntro, mutateTrackIntros, selectedTemplate]);

  // Effect: Orchestrate Spotify player pause/resume based on intro audio
  useEffect(() => {
    const handlePauseResume = async () => {
      if (isIntroAudioPlaying) {
        if (isPlaying) {
          setWasSpotifyPlaying(true);
          try {
            await togglePlay();
          } catch {
            // Optionally handle error
          }
        } else {
          setWasSpotifyPlaying(false);
        }
      } else {
        if (wasSpotifyPlaying) {
          try {
            await togglePlay();
          } catch {
            // Optionally handle error
          }
          setWasSpotifyPlaying(false);
        }
      }
    };
    handlePauseResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntroAudioPlaying]);

  // Handler for audio events
  const handleIntroAudioPlay = () => setIsIntroAudioPlaying(true);
  const handleIntroAudioPauseOrEnd = () => setIsIntroAudioPlaying(false);

  // Fetch the default prompt when session.user.id changes
  useEffect(() => {
    if (!session?.user?.id) return;
    // Remove unused code
  }, [session?.user?.id]);

  if (status === "loading") {
    return <div className="p-8 text-neutral">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-8 text-semantic-error text-center">
        Please log in with Spotify to use the Now Playing companion.
      </div>
    );
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
        <h2 className="text-xl font-semibold mb-2">Spotify Player is loading...</h2>
        <p>Waiting for the Spotify Web Playback SDK to connect.</p>
      </div>
    );
  }

  // If SDK is ready but no track, offer transfer playback
  if (!currentTrack && session.accessToken) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Playback is on another device</h2>
        <p className="mb-4">To enable AI intros and real-time controls, playback needs to happen in this browser tab.</p>
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
          {transferring ? "Transferring..." : "Play in this browser"}
        </button>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Nothing is playing</h2>
        <p>Start playing a track on Spotify to see the now playing companion.</p>
      </div>
    );
  }

  const track = currentTrack as SpotifyTrack;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {showLowCreditBanner && (
          <div className="w-full">
            <LowCreditBanner />
          </div>
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Now Playing</h1>
          <CreditBalance className="text-lg" />
        </div>
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
        {/* --- Template Selector (Above Intro Section) --- */}
        <div className="mb-6">
          {templatesLoading ? (
            <div className="flex items-center gap-2 text-neutral" role="status" aria-live="polite">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Loading templates…</span>
            </div>
          ) : templatesError ? (
            <div className="text-semantic-error" role="alert">{templatesError}</div>
          ) : (
            <>
              <TemplateSelector
                onSelect={setSelectedTemplate}
                selectedTemplate={selectedTemplate}
                templates={userTemplates}
              />
              {/* Minimal inline feedback for template selection */}
              {userTemplates.length === 0 && (
                <div className="text-xs text-neutral mt-2" role="status">No templates found. Create one to get started.</div>
              )}
            </>
          )}
        </div>

        {/* --- Intro Section (Below Player) --- */}
        <IntroControls
          introsEnabled={introsEnabled}
          setIntrosEnabled={setIntrosEnabled}
          introStatus={introStatus}
          introScript={introScript}
          introError={introError}
          introSuccess={introSuccess}
          selectedTemplate={selectedTemplate}
          handleTemplateSelect={setSelectedTemplate}
          currentTrack={track}
          isIntroAudioPlaying={isIntroAudioPlaying}
          audioRef={audioRef}
        />
        {/* Hidden audio element for playback logic */}
        <audio
          ref={audioRef}
          src={introScript?.audioUrl}
          onPlay={handleIntroAudioPlay}
          onPause={handleIntroAudioPauseOrEnd}
          onEnded={handleIntroAudioPauseOrEnd}
          preload="auto"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
} 