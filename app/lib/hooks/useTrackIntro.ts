import useSWR from 'swr';
import type { TrackIntro } from '@/app/types/Prompt';
import { getTrackIntro } from '@/app/lib/firestore';

export function useTrackIntro(userId?: string, trackId?: string, templateId?: string) {
  const shouldFetch = Boolean(userId && trackId && templateId);
  const { data, error, isLoading, mutate } = useSWR<TrackIntro | null>(
    shouldFetch ? ['track-intro', userId, trackId, templateId] : null,
    () => getTrackIntro(userId!, trackId!, templateId!)
  );

  return {
    intro: data,
    isLoading,
    error,
    mutate, // for revalidation
  };
} 