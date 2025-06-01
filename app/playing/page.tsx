"use client";

import { useSession } from "next-auth/react";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useState, useEffect, useRef } from "react";
import type { SpotifyTrack } from "@/app/types/Spotify";
import type { TrackIntro } from '@/app/types/Prompt';
import type { PromptTemplate } from '@/app/types/Prompt';
import { getTrackIntro, saveTrackIntro, getTrackIntros } from '@/app/lib/firestore';
import NowPlayingTrackInfo from '@/app/components/NowPlayingTrackInfo';
import IntroControls from '@/app/components/IntroControls';
import TemplateSelector from '@/app/components/TemplateSelector';
import CreditBalance from '@/app/components/CreditBalance';
import LowCreditBanner from '@/app/components/LowCreditBanner';
import { hasLowCredits } from '@/app/actions/credits';

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
    isPlaying,
    position,
    error: playerError,
    isReady: playerIsReady,
    deviceId,
    transferPlayback,
    pause,
    resume,
  } = useSpotifyPlayer();
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [introsEnabled, setIntrosEnabled] = useState(true);
  const [introStatus, setIntroStatus] = useState<IntroStatus>('idle');
  const [introScript, setIntroScript] = useState<TrackIntro | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState(false);
  const lastTrackIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isIntroAudioPlaying, setIsIntroAudioPlaying] = useState(false);
  const [wasSpotifyPlaying, setWasSpotifyPlaying] = useState(false);
  const [trackIntros, setTrackIntros] = useState<TrackIntro[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | undefined>(undefined);
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [showLowCreditBanner, setShowLowCreditBanner] = useState(false);

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

    async function getIntroFromDb() {
      if (!userId || !track?.id || !selectedTemplate?.id) return null;
      return await getTrackIntro(userId, track.id, selectedTemplate.id);
    }

    function generateIntro() {
      if (!userId || !track?.id || !selectedTemplate?.id) return;
      setIntroStatus('generating');
      setIntroScript(null);
      setIntroError(null);
      setIntroSuccess(false);
      fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          track: { ...track },
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          language: 'en',
          tone: 'conversational',
          length: 60,
          userAreaOfInterest: selectedTemplate.prompt
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.status === 'ready') {
            setIntroScript(data.intro);
            setIntroStatus('ready');
            lastTrackIdRef.current = track.id;
            // Save the intro to Firestore
            if (userId && track.id && selectedTemplate.id) {
              await saveTrackIntro(userId, track.id, selectedTemplate.id, data.intro);
            }
            setIntroSuccess(true);
            setTimeout(() => setIntroSuccess(false), 2000);
          } else {
            setIntroStatus('error');
            setIntroError(data.error || 'Failed to generate intro.');
          }
        })
        .catch((err) => {
          setIntroStatus('error');
          setIntroError(err?.message || 'Failed to generate intro.');
        });
    }

    async function updateIntro() {
      const intro = await getIntroFromDb();
      if (intro) {
        setIntroScript(intro);
        setIntroStatus('ready');
      } else {
        generateIntro();
      }
    }

    if (introsEnabled && userId && track && track.id && track.is_playable && selectedTemplate?.id) {
      updateIntro();
    }

    if (!introsEnabled || !track?.is_playable) {
      setIntroStatus('idle');
      setIntroScript(null);
      setIntroError(null);
      lastTrackIdRef.current = null;
    }
  }, [introsEnabled, currentTrack, session?.user?.id, selectedTemplate?.id, selectedTemplate?.prompt, selectedTemplate?.name]);

  // Effect: Orchestrate Spotify player pause/resume based on intro audio
  useEffect(() => {
    const handlePauseResume = async () => {
      if (isIntroAudioPlaying) {
        if (isPlaying) {
          setWasSpotifyPlaying(true);
          try {
            await pause();
          } catch {
            // Optionally handle error
          }
        } else {
          setWasSpotifyPlaying(false);
        }
      } else {
        if (wasSpotifyPlaying) {
          try {
            await resume();
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

  // Effect: Load all intros for current track
  useEffect(() => {
    async function loadTrackIntros() {
      if (!session?.user?.id || !currentTrack?.id) return;
      
      const intros = await getTrackIntros(session.user.id, currentTrack.id);
      setTrackIntros(intros);
      
      // If we have a selected template, find its intro
      if (selectedTemplate) {
        const templateIntro = intros.find(intro => intro.templateId === selectedTemplate.id);
        if (templateIntro) {
          setIntroScript(templateIntro);
          setIntroStatus('ready');
        }
      }
    }

    if (currentTrack?.id && session?.user?.id) {
      loadTrackIntros();
    }
  }, [currentTrack?.id, session?.user?.id, selectedTemplate]);

  // Update template selection handler
  const handleTemplateSelect = async (template: PromptTemplate) => {
    if (!template || !session?.user?.id) return;
    
    setSelectedTemplate(template);
    
    // Find existing intro for this template
    const existingIntro = trackIntros.find(intro => intro.templateId === template.id);
    
    if (existingIntro) {
      setIntroScript(existingIntro);
      setIntroStatus('ready');
    } else {
      // Generate new intro with template
      setIntroStatus('generating');
      setIntroScript(null);
      setIntroError(null);
      setIntroSuccess(false);
      
      try {
        const response = await fetch('/api/intro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackId: currentTrack?.id,
            track: currentTrack,
            templateId: template.id,
            templateName: template.name,
            language: 'en',
            tone: 'conversational',
            length: 60,
            userAreaOfInterest: template.prompt
          }),
        });

        const data = await response.json();
        if (response.ok && data.status === 'ready') {
          setIntroScript(data.intro);
          setIntroStatus('ready');
          setIntroSuccess(true);
          setTimeout(() => setIntroSuccess(false), 2000);
          
          // Update track intros list
          setTrackIntros(prev => [...prev, data.intro]);
        } else {
          setIntroStatus('error');
          setIntroError(data.error || 'Failed to generate intro.');
        }
      } catch (err) {
        setIntroStatus('error');
        setIntroError(err instanceof Error ? err.message : 'Failed to generate intro.');
      }
    }
  };

  // Fetch user templates on mount or when session changes
  useEffect(() => {
    async function fetchTemplates() {
      if (!session?.user?.id) return;
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const res = await import('@/app/lib/firestore');
        const userTemplates = await res.getUserPromptTemplates(session.user.id);
        setUserTemplates(userTemplates);
      } catch {
        setTemplatesError('Failed to load templates');
      } finally {
        setTemplatesLoading(false);
      }
    }
    fetchTemplates();
  }, [session?.user?.id]);

  // Add effect to check for low credits
  useEffect(() => {
    async function checkLowCredits() {
      if (!session?.user?.id) return;
      const isLow = await hasLowCredits(session.user.id);
      setShowLowCreditBanner(isLow);
    }
    checkLowCredits();
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

  if (playerError) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-semantic-error text-center">
        {playerError.message}
      </div>
    );
  }

  if (!playerIsReady) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Spotify Player is loading...</h2>
        <p>Waiting for the Spotify Web Playback SDK to connect.</p>
      </div>
    );
  }

  // If SDK is ready but no track, offer transfer playback
  if (!currentTrack && deviceId && session.accessToken) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818] text-center text-neutral">
        <h2 className="text-xl font-semibold mb-2">Playback is on another device</h2>
        <p className="mb-4">To enable AI intros and real-time controls, playback needs to happen in this browser tab.</p>
        <button
          className="btn btn-primary px-6 py-2 rounded font-semibold disabled:opacity-60"
          disabled={transferring}
          onClick={async () => {
            setTransferring(true);
            setTransferError(null);
            try {
              await transferPlayback(true);
            } catch (err) {
              setTransferError((err as Error).message || "Failed to transfer playback.");
            } finally {
              setTransferring(false);
            }
          }}
        >
          {transferring ? "Transferring..." : "Play in this browser"}
        </button>
        {transferError && <div className="text-semantic-error mt-2">{transferError}</div>}
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
          isPlaying={isPlaying}
          position={position}
          duration={duration}
          error={playerError}
          isReady={playerIsReady}
          deviceId={deviceId}
          onTransferPlayback={transferPlayback}
          transferring={transferring}
          transferError={transferError}
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
          handleTemplateSelect={handleTemplateSelect}
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