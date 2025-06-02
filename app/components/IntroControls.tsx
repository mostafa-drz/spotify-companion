import { Switch } from '@headlessui/react';
import { PlayIcon, ArrowPathIcon, PauseIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { MarkdownContent } from '@/app/components/MarkdownContent';
import type { PromptTemplate } from '@/app/types/Prompt';
import type { SpotifyTrack } from '@/app/types/Spotify';
import { useGenerateIntro } from '@/app/lib/hooks/useGenerateIntro';
import ProgressBar from './ui/ProgressBar';
import { useEffect, useRef, useState } from 'react';
import { useTrackIntro } from '@/app/lib/hooks/useTrackIntro';

interface IntroControlsProps {
  introsEnabled: boolean;
  setIntrosEnabled: (enabled: boolean) => void;
  selectedTemplate?: PromptTemplate;
  currentTrack: SpotifyTrack;
  isIntroAudioPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function IntroControls({
  introsEnabled,
  setIntrosEnabled,
  selectedTemplate,
  currentTrack,
  isIntroAudioPlaying,
  audioRef,
}: IntroControlsProps) {
  const trackId = currentTrack?.id || undefined;
  const templateId = selectedTemplate?.id || undefined;
  const { intro: introScript, isLoading: introLoading, error: introError, mutate } = useTrackIntro(trackId, templateId);
  const { generateIntro, isLoading: isGenerating, error: generateError } = useGenerateIntro();

  const isLoading = introLoading || isGenerating;
  const error = introError || generateError;

  // Track last generated track/template to avoid duplicate calls
  const lastGenRef = useRef<{ trackId: string; templateId: string } | null>(null);
  const [pendingGen, setPendingGen] = useState(false);

  useEffect(() => {
    if (!selectedTemplate || !selectedTemplate.id || !currentTrack || isLoading) return;
    if (introScript) {
      setPendingGen(false);
      return;
    }
    const lastGen = lastGenRef.current;
    if (
      !pendingGen &&
      (!lastGen || lastGen.trackId !== currentTrack.id || lastGen.templateId !== selectedTemplate.id)
    ) {
      setPendingGen(true);
      generateIntro({
        userId: '',
        trackId: currentTrack.id || '',
        track: { ...currentTrack },
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        language: selectedTemplate.language ?? 'en',
        tone: selectedTemplate.tone ?? 'conversational',
        length: selectedTemplate.length ?? 60,
        templatePrompt: selectedTemplate.prompt
      }).then(async () => {
        await mutate();
        setPendingGen(false);
        lastGenRef.current = { trackId: currentTrack.id || '', templateId: selectedTemplate.id };
      });
    }
  }, [selectedTemplate?.id, currentTrack?.id]);

  function handleRegenerate() {
    if (!selectedTemplate || !selectedTemplate.id || !currentTrack || isLoading) return;
    generateIntro({
      userId: '',
      trackId: currentTrack.id || '',
      track: { ...currentTrack },
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      language: selectedTemplate.language ?? 'en',
      tone: selectedTemplate.tone ?? 'conversational',
      length: selectedTemplate.length ?? 60,
      templatePrompt: selectedTemplate.prompt
    }).then(async () => {
      await mutate();
    });
  }

  function msToTime(ms: number) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
  return (
    <>
      {/* Intros toggle */}
      <div className="flex items-center gap-3 mt-4 mb-6">
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
      {/* Intro script status and display */}
      <div className="mb-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <span className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
            <span>Generating…</span>
          </div>
        )}
        {introScript && !isLoading && !error && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 sm:p-4 text-neutral-900 dark:text-neutral-100 text-base shadow-inner">
            {/* Flex row for label and regenerate button */}
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-primary text-lg">Intro:</span>
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
                  <span className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
                ) : (
                  <>
                    <ArrowPathIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300 text-sm hidden sm:inline">Regenerate Intro</span>
                  </>
                )}
              </button>
            </div>
            <div aria-busy={isLoading}>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
                <MarkdownContent content={introScript.introText} />
              </div>
              {/* Success and error messages can be handled here if needed */}
            </div>
            {/* Audio playback controls */}
            {introScript.audioUrl && (
              <div className="mt-4 flex flex-col gap-2 items-center">
                {/* Custom Progress Bar */}
                <div className="flex items-center gap-2 w-full justify-center">
                  <span className="text-xs text-neutral w-10 text-right tabular-nums">
                    {audioRef.current?.currentTime ? msToTime(audioRef.current.currentTime * 1000) : '0:00'}
                  </span>
                  <div className="flex-1 max-w-xs">
                    <ProgressBar audioRef={audioRef} isPlaying={isIntroAudioPlaying} />
                  </div>
                  <span className="text-xs text-neutral w-10 tabular-nums">
                    {audioRef.current?.duration ? msToTime(audioRef.current.duration * 1000) : '0:00'}
                  </span>
                </div>
                {/* Custom Controls Row */}
                <div className="flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 dark:border-gray-700 mt-1 w-full max-w-xs">
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
                {/* Hidden audio element for playback logic (should be rendered in parent) */}
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="text-semantic-error mt-2" role="alert">{error.message || 'Failed to load or generate intro.'}</div>
        )}
      </div>
    </>
  );
} 