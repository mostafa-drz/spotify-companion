import { Switch } from '@headlessui/react';
import { PlayIcon, ArrowPathIcon, PauseIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { MarkdownContent } from '@/app/components/MarkdownContent';
import type { TrackIntro, PromptTemplate } from '@/app/types/Prompt';
import type { SpotifyTrack } from '@/app/types/Spotify';
import { RefObject } from 'react';

type IntroStatus = 'idle' | 'generating' | 'ready' | 'error';

interface IntroControlsProps {
  introsEnabled: boolean;
  setIntrosEnabled: (enabled: boolean) => void;
  introStatus: IntroStatus;
  introScript: TrackIntro | null;
  introError: string | null;
  introSuccess: boolean;
  selectedTemplate?: PromptTemplate;
  handleTemplateSelect: (template: PromptTemplate) => void;
  currentTrack: SpotifyTrack;
  isIntroAudioPlaying: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
}

function isGenerating(status: IntroStatus) {
  return status === 'generating';
}
function isReady(status: IntroStatus) {
  return status === 'ready';
}
function isError(status: IntroStatus) {
  return status === 'error';
}

export default function IntroControls({
  introsEnabled,
  setIntrosEnabled,
  introStatus,
  introScript,
  introError,
  introSuccess,
  selectedTemplate,
  handleTemplateSelect,
  currentTrack,
  isIntroAudioPlaying,
  audioRef,
}: IntroControlsProps) {
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
        {isGenerating(introStatus) && (
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <span className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
            <span>Generating…</span>
          </div>
        )}
        {isReady(introStatus) && introScript && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 sm:p-4 text-neutral-900 dark:text-neutral-100 text-base shadow-inner relative">
            {/* Regenerate Intro Button (top right) */}
            <button
              type="button"
              aria-label="Regenerate Intro"
              title="Regenerate Intro"
              tabIndex={0}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2 justify-center transition-colors duration-200"
              onClick={() => selectedTemplate && handleTemplateSelect(selectedTemplate)}
              disabled={isGenerating(introStatus) || !currentTrack}
            >
              {isGenerating(introStatus) ? (
                <span className="inline-block h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
              ) : (
                <>
                  <ArrowPathIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-300 text-sm hidden sm:inline">Regenerate Intro</span>
                </>
              )}
            </button>
            <span className="font-semibold text-primary text-lg">Intro:</span>
            <div className="mt-2" aria-busy={isGenerating(introStatus)}>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
                <MarkdownContent content={introScript.introText} />
              </div>
              {/* Inline feedback messages */}
              {introSuccess && (
                <div className="mt-3 text-green-700 dark:text-green-400 text-sm" role="status">Intro updated!</div>
              )}
              {isError(introStatus) && introError && (
                <div className="mt-3 text-red-700 dark:text-red-400 text-sm" role="alert">{introError}</div>
              )}
            </div>
            {/* Audio playback controls */}
            {introScript.audioUrl && (
              <div className="mt-4 flex flex-col gap-2">
                {/* Custom Progress Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral w-10 text-right tabular-nums">
                    {audioRef.current?.currentTime ? msToTime(audioRef.current.currentTime * 1000) : '0:00'}
                  </span>
                  <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full relative overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all"
                      style={{ width: audioRef.current && audioRef.current.duration ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-neutral w-10 tabular-nums">
                    {audioRef.current?.duration ? msToTime(audioRef.current.duration * 1000) : '0:00'}
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
                {/* Hidden audio element for playback logic (should be rendered in parent) */}
              </div>
            )}
          </div>
        )}
        {isError(introStatus) && introError && (
          <div className="text-semantic-error mt-2" role="alert">{introError}</div>
        )}
      </div>
    </>
  );
} 