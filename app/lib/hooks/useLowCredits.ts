import useSWR from 'swr';
import { hasLowCredits } from '@/app/actions/credits';
import { useSession } from 'next-auth/react';

export function useLowCredits() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const shouldFetch = Boolean(userId);
  const { data, error, isLoading, mutate } = useSWR<boolean>(
    shouldFetch ? ['low-credits', userId] : null,
    () => hasLowCredits(userId!)
  );

  return {
    isLow: !!data,
    isLoading,
    error,
    mutate, // for revalidation
  };
} 