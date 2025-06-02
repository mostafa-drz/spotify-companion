import useSWR from 'swr';
import type { TrackIntro } from '@/app/types/Prompt';
import { getTrackIntro } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';

export function useTrackIntro(trackId?: string, templateId?: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const shouldFetch = Boolean(userId && trackId && templateId);
  const { data, error, isLoading, mutate } = useSWR<TrackIntro | null>(
    shouldFetch ? ['track-intro', userId, trackId, templateId] : null,
    () => getTrackIntro(userId!, trackId!, templateId!)
  );
  console.log('useTrackIntro', {
    userId,
    trackId,
    templateId,
    data,
    error,
    isLoading,
  });
  return {
    intro: data,
    isLoading,
    error,
    mutate, // for revalidation
  };
} 