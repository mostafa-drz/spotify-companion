import useSWR from 'swr';
import { hasLowCredits } from '@/app/actions/credits';

export function useLowCredits(userId?: string) {
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