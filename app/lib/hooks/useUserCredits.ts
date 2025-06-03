import useSWR from 'swr';
import { getUserCredits } from '@/app/actions/credits';
import { useSession } from 'next-auth/react';

export function useUserCredits() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const shouldFetch = Boolean(userId);
  const { data, error, isLoading, mutate } = useSWR<{
    available: number;
    used: number;
  }>(shouldFetch ? ['user-credits', userId] : null, () =>
    getUserCredits(userId!)
  );

  return {
    credits: data || { available: 0, used: 0 },
    isLoading,
    error,
    mutate, // for revalidation
  };
}
