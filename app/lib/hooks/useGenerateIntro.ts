import useSWRMutation from 'swr/mutation';
import type { TrackIntro } from '@/app/types/Prompt';

interface GenerateIntroParams {
  userId: string;
  trackId: string;
  track: unknown;
  templateId: string;
  templateName: string;
  language?: string;
  tone?: string;
  length?: number;
  userAreaOfInterest?: string;
}

async function generateIntroFetcher(
  key: string,
  { arg }: { arg: GenerateIntroParams }
): Promise<TrackIntro> {
  const response = await fetch('/api/intro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trackId: arg.trackId,
      track: arg.track,
      templateId: arg.templateId,
      templateName: arg.templateName,
      language: arg.language || 'en',
      tone: arg.tone || 'conversational',
      length: arg.length || 60,
      userAreaOfInterest: arg.userAreaOfInterest || ''
    }),
  });
  const data = await response.json();
  if (!response.ok || data.status !== 'ready') {
    throw new Error(data.error || 'Failed to generate intro');
  }
  return data.intro;
}

export function useGenerateIntro() {
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'generate-intro',
    generateIntroFetcher
  );
  return {
    generateIntro: trigger,
    data,
    error,
    isLoading: isMutating,
    reset,
  };
} 