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
import { getDefaultPrompt, updateDefaultPrompt, getTrackIntro, saveTrackIntro } from '@/app/lib/firestore';
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
  const [introStatus, setIntroStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [introScript, setIntroScript] = useState<TrackIntro | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isIntroAudioPlaying, setIsIntroAudioPlaying] = useState(false);
  const [wasSpotifyPlaying, setWasSpotifyPlaying] = useState(false);
  const [defaultPrompt, setDefaultPrompt] = useState("");
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
      setDefaultPrompt(snap.exists() ? snap.data().defaultTrackPrompt || "" : "");
    });
  }, [session?.user?.id]);

  // Add a handler for template selection
  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    // If we have a current track, regenerate the intro with the new template
    if (currentTrack?.id) {
      handleRegenerateIntro(template);
    }
  };

  // Modify the regenerate intro handler to accept a template
  const handleRegenerateIntro = (template?: PromptTemplate) => {
    if (!session?.user?.id || !currentTrack?.id) return;
    setIntroStatus('generating');
    setIntroScript(null);
    setIntroError(null);
    fetch('/api/intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackId: currentTrack.id,
        track: {
          ...currentTrack,
          prompt: template?.prompt || defaultPrompt,
        },
        regenerate: true,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.status === 'ready') {
          setIntroScript(data.intro);
          setIntroStatus('ready');
          lastTrackIdRef.current = currentTrack.id;
        } else {
          setIntroStatus('error');
          setIntroError(data.error || 'Failed to generate intro.');
        }
      })
      .catch((err) => {
        setIntroStatus('error');
        setIntroError(err?.message || 'Failed to generate intro.');
      });
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
    <div className="max-w-xl mx-auto mt-12 p-6 rounded-lg shadow bg-white dark:bg-[#181818]">
      {/* Default Prompt Section */}
      <div className="mb-8">
        <DefaultPromptEditor userId={session.user.id} />
      </div>
      {/* Template selector */}
      <div className="mb-8">
        <TemplateSelector
          onSelect={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
        />
      </div>
      {/* Intros toggle */}
      <div className="flex items-center gap-3 mb-8">
        <Switch.Group>
          <Switch
            checked={introsEnabled}
            onChange={setIntrosEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              introsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                introsEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </Switch>
          <Switch.Label className="ml-4 text-base font-medium text-foreground cursor-pointer">
            Enable AI Intros for Now Playing
          </Switch.Label>
        </Switch.Group>
      </div>
      {/* Track Info Section */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src={track.album.images[0]?.url || "/track-placeholder.png"}
          alt={track.album.name}
          className="w-28 h-28 rounded-lg shadow border border-gray-200 dark:border-gray-700 object-cover"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-primary truncate mb-1">{track.name}</h2>
          <div className="text-neutral text-base truncate mb-1">{track.artists.map(a => a.name).join(", ")}</div>
          <div className="text-neutral text-sm truncate">{track.album.name}</div>
          <div className="text-xs text-neutral mt-2">Track ID: {track.id ?? '—'}</div>
          <div className="text-xs text-neutral">Playable: {track.is_playable ? 'Yes' : 'No'}</div>
          <div className="text-xs text-neutral">Type: {track.type} ({track.media_type})</div>
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
      <div className="mt-4 mb-8 flex items-center gap-4">
        <span className={`text-sm font-medium ${isPlaying ? 'text-primary' : 'text-neutral'}`}>{isPlaying ? 'Playing' : 'Paused'}</span>
      </div>
      {/* Intro script status and display */}
      <div className="mb-8">
        {introStatus === 'generating' && <div className="text-neutral">Generating intro...</div>}
        {introStatus === 'ready' && introScript && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-foreground text-base shadow-inner relative">
            {/* Regenerate Intro Button (top right) */}
            <button
              type="button"
              aria-label="Regenerate Intro"
              title="Regenerate Intro"
              className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              onClick={() => handleRegenerateIntro(selectedTemplate || undefined)}
              disabled={introStatus === 'generating' || !currentTrack || (!selectedTemplate && !defaultPrompt)}
            >
              <ArrowPathIcon className="h-6 w-6 text-green-600" />
            </button>
            <span className="font-semibold text-primary">Intro:</span>
            <div className="mt-2">
              <MarkdownContent content={introScript.introText} />
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
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 mt-1">
                  <button
                    type="button"
                    aria-label="Play"
                    title="Play"
                    className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    onClick={() => audioRef.current?.play()}
                    disabled={isIntroAudioPlaying}
                  >
                    <PlayIcon className="h-6 w-6 text-green-600" />
                  </button>
                  <button
                    type="button"
                    aria-label="Replay Audio"
                    title="Replay Audio"
                    className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    onClick={() => audioRef.current?.pause()}
                    disabled={!isIntroAudioPlaying}
                  >
                    <PauseIcon className="h-6 w-6 text-green-600" />
                  </button>
                  <div className="flex-1" />
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