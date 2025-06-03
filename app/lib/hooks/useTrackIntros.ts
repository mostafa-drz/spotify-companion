import useSWR from 'swr';
import type { TrackIntro } from '@/app/types/Prompt';
import { getTrackIntros } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';

export function useTrackIntros(trackId?: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const shouldFetch = Boolean(userId && trackId);
  const { data, error, isLoading, mutate } = useSWR<TrackIntro[]>(
    shouldFetch ? ['track-intros', userId, trackId] : null,
    () => getTrackIntros(userId!, trackId)
  );

  return {
    trackIntros: data || [],
    isLoading,
    error,
    mutate, // for revalidation after add/edit/delete
  };
}
