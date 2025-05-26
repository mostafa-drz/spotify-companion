"use client";

import { useSession } from "next-auth/react";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useState, useEffect, useRef } from "react";
import type { SpotifyTrack } from "@/app/types/Spotify";
import { clientDb } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MarkdownContent } from '@/app/components/MarkdownContent';
import type { TrackIntro } from '@/app/types/Prompt';
import TemplateSelector from '@/app/components/TemplateSelector';
import type { PromptTemplate } from '@/app/types/Prompt';
import { getDefaultPrompt, updateDefaultPrompt, getTrackIntro, saveTrackIntro, getTrackIntros } from '@/app/lib/firestore';
import { Switch } from '@headlessui/react';
import { PlayIcon, ArrowPathIcon, PauseIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';

declare global {
  interface Window {
    spotifyPlayer?: {
      pause: () => void;
      resume: () => void;
    };
  }
}

function DefaultPromptEditor({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getDefaultPrompt(userId)
      .then(setPrompt)
      .catch(err => {
        console.error(err);
        setError("Failed to load prompt");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateDefaultPrompt(userId, prompt);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError("Failed to save prompt");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  if (loading) return <div className="mb-4">Loading prompt…</div>;

  return (
    <div className="mb-6 p-4 bg-white/60 dark:bg-[#222]/60 rounded-lg border border-gray-200 dark:border-gray-800">
      <label htmlFor="defaultPrompt" className="block font-semibold mb-2">Default AI Prompt</label>
      <textarea
        id="defaultPrompt"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={3}
        className="w-full border rounded p-2 text-sm bg-white dark:bg-[#181818]"
        placeholder="e.g. Tell me more about this track, its history, and cultural impact."
        disabled={saving}
      />
      <div className="flex items-center gap-2 mt-2">
        <button onClick={handleSave} className="btn btn-primary px-4 py-1.5 rounded" disabled={saving}>
          {saving ? "Saving…" : "Save Prompt"}
        </button>
        {success && <span className="text-green-600 text-sm">Saved!</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  );
}

type IntroStatus = 'idle' | 'generating' | 'ready' | 'error';

export default function NowPlayingPage() {
  const { data: session, status } = useSession();
  const {
    currentTrack,
    isPlaying,
    position,
    error: playerError,
    isReady,
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

  // Fallback for duration if not in context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const duration = (currentTrack as any)?.duration_ms ?? 0;

  // Effect: Generate intro script on track change if enabled
  useEffect(() => {
    const userId = session?.user?.id;
    const track = currentTrack as SpotifyTrack;

    async function getIntroFromDb() {
      if (!userId || !track?.id) return null;
      return await getTrackIntro(userId, track.id);
    }

    function generateIntro() {
      if (!userId || !track?.id) return;
      
      setIntroStatus('generating');
      setIntroScript(null);
      setIntroError(null);
      setIntroSuccess(false);
      
      fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          track: {
            ...track,
          },
          language: 'en',
          tone: 'conversational',
          length: 60,
          userAreaOfInterest: 'music'
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.status === 'ready') {
            setIntroScript(data.intro);
            setIntroStatus('ready');
            lastTrackIdRef.current = track.id;
            // Save the intro to Firestore
            if (userId && track.id) {
              await saveTrackIntro(userId, track.id, data.intro);
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

    if (introsEnabled && userId && track && track.id && track.is_playable && track.id !== lastTrackIdRef.current) {
      updateIntro();
    }

    if (!introsEnabled || !track?.is_playable) {
      setIntroStatus('idle');
      setIntroScript(null);
      setIntroError(null);
      lastTrackIdRef.current = null;
    }

  }, [introsEnabled, currentTrack, session?.user?.id]);

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
    getDoc(doc(clientDb, "users", session.user.id)).then((snap) => {
      // Remove unused defaultPrompt state and related code
      // const [defaultPrompt, setDefaultPrompt] = useState(snap.exists() ? snap.data().defaultTrackPrompt || "" : "");
    });
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
    if (!template) return;
    
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

  if (!isReady) {
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

  // Progress bar width
  const progressPercent = typeof duration === 'number' && duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  const track = currentTrack as SpotifyTrack;

  return (
    <div className="max-w-xl mx-auto mt-12 p-4 sm:p-6 rounded-lg shadow bg-white dark:bg-[#181818]">
      {/* Default Prompt Section */}
      <div className="mb-8">
        <DefaultPromptEditor userId={session.user.id} />
      </div>
      {/* Template selector with intro count */}
      <div className="mb-8">
        <TemplateSelector
          onSelect={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
          introCounts={trackIntros.reduce((acc, intro) => {
            if (intro.templateId) {
              acc[intro.templateId] = (acc[intro.templateId] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>)}
        />
      </div>
      {/* Intros toggle */}
      <div className="flex items-center gap-3 mb-8">
        <Switch.Group>
          <Switch
            checked={introsEnabled}
            onChange={setIntrosEnabled}
            aria-label="Enable AI Intros for Now Playing"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              introsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow ${
                introsEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
              aria-hidden="true"
            />
          </Switch>
          <Switch.Label className="ml-4 text-base font-medium text-foreground cursor-pointer select-none transition-colors duration-200">
            Enable AI Intros for Now Playing
          </Switch.Label>
        </Switch.Group>
      </div>
      {/* Track Info Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <img
          src={track.album.images[0]?.url || "/track-placeholder.png"}
          alt={track.album.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shadow border border-gray-200 dark:border-gray-700 object-cover mb-4 sm:mb-0"
        />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2 leading-tight whitespace-normal break-words">{track.name}</h2>
          <div className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-1 whitespace-normal break-words">{track.artists.map(a => a.name).join(", ")}</div>
          <div className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mb-2 whitespace-normal break-words">{track.album.name}</div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 break-words">Track ID: {track.id ?? '—'}</div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 break-words">Playable: {track.is_playable ? 'Yes' : 'No'}</div>
          <div className="text-xs text-neutral-700 dark:text-neutral-300 break-words">Type: {track.type} ({track.media_type})</div>
        </div>
      </div>
      {/* Progress Bar Section */}
      <div className="mb-8">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-2 bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral mt-1">
          <span>{msToTime(position)}</span>
          <span>{msToTime(duration)}</span>
        </div>
      </div>
      {/* Playback Status */}
      <div className="mt-4 mb-8 flex items-center gap-4 justify-center sm:justify-start">
        <span className={`text-sm font-medium ${isPlaying ? 'text-primary' : 'text-neutral'}`}>{isPlaying ? 'Playing' : 'Paused'}</span>
      </div>
      {/* Intro script status and display */}
      <div className="mb-8">
        {introStatus === 'generating' && <div className="text-neutral">Generating intro...</div>}
        {introStatus === 'ready' && introScript && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 sm:p-4 text-neutral-900 dark:text-neutral-100 text-base shadow-inner relative">
            {/* Regenerate Intro Button (top right) */}
            <button
              type="button"
              aria-label="Regenerate Intro"
              title="Regenerate Intro"
              tabIndex={0}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center transition-colors duration-200"
              onClick={() => selectedTemplate && handleTemplateSelect(selectedTemplate)}
              disabled={introStatus === 'generating' || !currentTrack}
            >
              {introStatus === 'generating' ? (
                <span className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
              ) : (
                <ArrowPathIcon className="h-6 w-6 text-green-600" />
              )}
            </button>
            <span className="font-semibold text-primary text-lg">Intro:</span>
            <div className="mt-2" aria-busy={introStatus === 'generating'}>
              {introStatus === 'generating' && (
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <span className="inline-block h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
                  <span>Generating intro…</span>
                </div>
              )}
              <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
                <MarkdownContent content={introScript.introText} />
              </div>
              {/* Inline feedback messages */}
              {introSuccess && (
                <div className="mt-3 text-green-700 dark:text-green-400 text-sm" role="status">Intro updated!</div>
              )}
              {introStatus === 'error' && introError && (
                <div className="mt-3 text-red-700 dark:text-red-400 text-sm" role="alert">{introError}</div>
              )}
            </div>
            {/* Audio playback controls */}
            {introScript.audioUrl && (
              <div className="mt-4 flex flex-col gap-2">
                {/* Custom Progress Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral w-10 text-right tabular-nums">
                    {msToTime(audioRef.current?.currentTime ? audioRef.current.currentTime * 1000 : 0)}
                  </span>
                  <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full relative overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all"
                      style={{ width: audioRef.current && audioRef.current.duration ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-neutral w-10 tabular-nums">
                    {msToTime(audioRef.current?.duration ? audioRef.current.duration * 1000 : 0)}
                  </span>
                </div>
                {/* Custom Controls Row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 dark:border-gray-700 mt-1">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <button
                      type="button"
                      aria-label="Play"
                      title="Play"
                      tabIndex={0}
                      className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                      onClick={() => audioRef.current?.play()}
                      disabled={isIntroAudioPlaying}
                    >
                      <PlayIcon className="h-6 w-6 text-green-600" />
                    </button>
                    <button
                      type="button"
                      aria-label="Replay Audio"
                      title="Replay Audio"
                      tabIndex={0}
                      className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          audioRef.current.play();
                        }
                      }}
                    >
                      <ArrowUturnLeftIcon className="h-6 w-6 text-green-600" />
                    </button>
                    <button
                      type="button"
                      aria-label="Pause"
                      title="Pause"
                      tabIndex={0}
                      className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                      onClick={() => audioRef.current?.pause()}
                      disabled={!isIntroAudioPlaying}
                    >
                      <PauseIcon className="h-6 w-6 text-green-600" />
                    </button>
                  </div>
                </div>
                {/* Hidden audio element for playback logic */}
                <audio
                  ref={audioRef}
                  src={introScript.audioUrl}
                  onPlay={handleIntroAudioPlay}
                  onPause={handleIntroAudioPauseOrEnd}
                  onEnded={handleIntroAudioPauseOrEnd}
                  preload="auto"
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        )}
        {introStatus === 'error' && (
          <div className="text-semantic-error">{introError}</div>
        )}
      </div>
    </div>
  );
}

function msToTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
} 