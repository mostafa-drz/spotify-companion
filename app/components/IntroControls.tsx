import { Switch } from '@headlessui/react';
import {
  PlayIcon,
  ArrowPathIcon,
  PauseIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MarkdownContent } from '@/app/components/MarkdownContent';
import { PromptTemplate, Tone } from '@/app/types/Prompt';
import type { SpotifyTrack } from '@/app/types/Spotify';
import { useGenerateIntro } from '@/app/lib/hooks/useGenerateIntro';
import ProgressBar from './ui/ProgressBar';
import { useEffect, useRef, useState } from 'react';
import { useTrackIntro } from '@/app/lib/hooks/useTrackIntro';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import { useUserCredits } from '@/app/lib/hooks/useUserCredits';
import { useLowCredits } from '@/app/lib/hooks/useLowCredits';

interface IntroControlsProps {
  introsEnabled: boolean;
  setIntrosEnabled: (enabled: boolean) => void;
  selectedTemplate?: PromptTemplate;
  currentTrack: SpotifyTrack;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onSkip?: () => void;
  onPauseSpotify?: () => void;
}

export default function IntroControls({
  introsEnabled,
  setIntrosEnabled,
  selectedTemplate,
  currentTrack,
  audioRef,
  onSkip,
  onPauseSpotify,
}: IntroControlsProps) {
  const trackId = currentTrack?.id || undefined;
  const templateId = selectedTemplate?.id || undefined;
  const {
    intro: introScript,
    isLoading: introLoading,
    error: introError,
    mutate,
  } = useTrackIntro(trackId, templateId);
  const {
    generateIntro,
    isLoading: isGenerating,
    error: generateError,
  } = useGenerateIntro();
  const { credits } = useUserCredits();
  const { isLow: isLowCredits } = useLowCredits();

  const isLoading = introLoading || isGenerating;
  const error = introError || generateError;

  // Track last generated track/template to avoid duplicate calls
  const lastGenRef = useRef<{ trackId: string; templateId: string } | null>(
    null
  );
  const [pendingGen, setPendingGen] = useState(false);

  // Add state for audio playback
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Listen to audio events to update playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsAudioPlaying(true);
      // Pause Spotify when intro starts playing
      onPauseSpotify?.();
    };
    const handlePause = () => setIsAudioPlaying(false);
    const handleEnded = () => setIsAudioPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, onPauseSpotify]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // Handle replay
  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  useEffect(() => {
    if (!selectedTemplate || !selectedTemplate.id || !currentTrack || isLoading)
      return;
    if (introScript) {
      setPendingGen(false);
      return;
    }
    const lastGen = lastGenRef.current;
    if (
      introsEnabled &&
      !pendingGen &&
      (!lastGen ||
        lastGen.trackId !== currentTrack.id ||
        lastGen.templateId !== selectedTemplate.id)
    ) {
      setPendingGen(true);
      generateIntro({
        trackId: currentTrack.id || '',
        track: { ...currentTrack },
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        language: selectedTemplate.language ?? 'en',
        tone: (selectedTemplate.tone as Tone) ?? Tone.Conversational,
        length: selectedTemplate.length ?? 60,
        templatePrompt: selectedTemplate.prompt,
      }).then(async () => {
        await mutate();
        setPendingGen(false);
        lastGenRef.current = {
          trackId: currentTrack.id || '',
          templateId: selectedTemplate.id,
        };
      });
    }
  }, [
    selectedTemplate?.id,
    currentTrack?.id,
    generateIntro,
    mutate,
    isLoading,
    introScript,
    currentTrack,
    selectedTemplate,
    lastGenRef,
    pendingGen,
    introsEnabled,
  ]);

  function handleRegenerate() {
    if (!selectedTemplate || !selectedTemplate.id || !currentTrack || isLoading)
      return;
    generateIntro({
      trackId: currentTrack.id || '',
      track: { ...currentTrack },
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      language: selectedTemplate.language ?? 'en',
      tone: (selectedTemplate.tone as Tone) ?? Tone.Conversational,
      length: selectedTemplate.length ?? 60,
      templatePrompt: selectedTemplate.prompt,
    }).then(async () => {
      await mutate();
    });
  }

  function msToTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  }

  // Skip intro handler
  const handleSkipIntro = () => {
    // Pause intro audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Call the onSkip callback to resume Spotify
    onSkip?.();
  };

  return (
    <>
      {/* Intros toggle and credit info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
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
          {isLowCredits && (
            <span className="ml-2 flex items-center text-yellow-600 text-xs">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Low credits
            </span>
          )}
        </div>
        <p className="text-sm text-neutral ml-14">
          {introsEnabled
            ? 'AI will generate and play an intro before each track'
            : 'Tracks will play normally without AI intros'}
        </p>
      </div>
      {/* Intro script status and display */}
      <div className="mb-8">
        {isLoading && (
          <div
            className="flex items-center gap-2 text-green-600 mb-2"
            role="status"
            aria-live="polite"
          >
            <span
              className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
              aria-label="Loading"
            />
            <span>Generating intro…</span>
            <button
              type="button"
              className="ml-4 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs font-medium border border-gray-300"
              onClick={handleSkipIntro}
            >
              Skip Intro
            </button>
          </div>
        )}
        {introScript && !isLoading && !error && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 sm:p-4 text-neutral-900 dark:text-neutral-100 text-base shadow-inner">
            {/* Flex row for label and regenerate button */}
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-primary text-lg flex items-center gap-1">
                <CpuChipIcon className="w-5 h-5" /> Intro:
              </span>
              <button
                type="button"
                aria-label="Regenerate Intro"
                title="Regenerate Intro"
                tabIndex={0}
                className="px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2 justify-center transition-colors duration-200"
                onClick={handleRegenerate}
                disabled={isLoading || !currentTrack}
              >
                {isLoading ? (
                  <span
                    className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
                    aria-label="Loading"
                  />
                ) : (
                  <>
                    <ArrowPathIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300 text-sm hidden sm:inline">
                      Regenerate Intro
                    </span>
                  </>
                )}
              </button>
            </div>
            <div aria-busy={isLoading}>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
                <MarkdownContent content={introScript.introText} />
              </div>
            </div>
            {/* Audio playback controls */}
            {introScript.audioUrl && (
              <div className="mt-4 flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2 w-full justify-center mb-1">
                  <CpuChipIcon className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">
                    Playing: AI Intro
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full justify-center">
                  <span className="text-xs text-neutral w-10 text-right tabular-nums">
                    {audioRef.current?.currentTime
                      ? msToTime(audioRef.current.currentTime * 1000)
                      : '0:00'}
                  </span>
                  <div className="flex-1 max-w-xs">
                    <ProgressBar
                      audioRef={audioRef}
                      isPlaying={isAudioPlaying}
                    />
                  </div>
                  <span className="text-xs text-neutral w-10 tabular-nums">
                    {audioRef.current?.duration
                      ? msToTime(audioRef.current.duration * 1000)
                      : '0:00'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 dark:border-gray-700 mt-1 w-full max-w-xs">
                  {!isAudioPlaying ? (
                    <button
                      type="button"
                      aria-label="Play"
                      title="Play"
                      tabIndex={0}
                      className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                      onClick={handlePlayPause}
                    >
                      <PlayIcon className="h-6 w-6 text-green-600" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Pause"
                      title="Pause"
                      tabIndex={0}
                      className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                      onClick={handlePlayPause}
                    >
                      <PauseIcon className="h-6 w-6 text-green-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Replay Audio"
                    title="Replay Audio"
                    tabIndex={0}
                    className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                    onClick={handleReplay}
                  >
                    <ArrowUturnLeftIcon className="h-6 w-6 text-green-600" />
                  </button>
                  {isAudioPlaying && (
                    <button
                      type="button"
                      aria-label="Skip Intro"
                      title="Skip Intro"
                      tabIndex={0}
                      className="p-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-yellow-100 dark:hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors duration-200"
                      onClick={handleSkipIntro}
                    >
                      Skip Intro
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {error && (
          <div
            className="text-semantic-error mt-2 flex items-center gap-2"
            role="alert"
          >
            {error.message || 'Failed to load or generate intro.'}
            <button
              type="button"
              className="ml-2 px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium border-b border-red-300"
              onClick={() => mutate()}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      {/* Manual mode: Generate Intro button */}
      {!introsEnabled && !introScript && (
        <div className="flex items-center gap-2 -mt-8">
          <button
            type="button"
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
            onClick={handleRegenerate}
            disabled={isLoading || !selectedTemplate || credits.available <= 0}
          >
            Generate Intro
          </button>
          {credits.available <= 0 && (
            <span className="text-xs text-red-600 ml-2">
              Not enough credits
            </span>
          )}
        </div>
      )}
    </>
  );
}
