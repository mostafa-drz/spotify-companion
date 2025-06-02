import useSWR from 'swr';
import { getUserCredits } from '@/app/actions/credits';

export function useUserCredits(userId?: string) {
  const shouldFetch = Boolean(userId);
  const { data, error, isLoading, mutate } = useSWR<{ available: number; used: number }>(
    shouldFetch ? ['user-credits', userId] : null,
    () => getUserCredits(userId!)
  );

  return {
    credits: data || { available: 0, used: 0 },
    isLoading,
    error,
    mutate, // for revalidation
  };
} 