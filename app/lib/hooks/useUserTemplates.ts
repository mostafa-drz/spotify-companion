import useSWR from 'swr';
import type { PromptTemplate } from '@/app/types/Prompt';
import { getUserPromptTemplates } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';

export function useUserTemplates() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const shouldFetch = Boolean(userId);
  const { data, error, isLoading, mutate } = useSWR<PromptTemplate[]>(
    shouldFetch ? ['user-templates', userId] : null,
    () => getUserPromptTemplates(userId!)
  );

  return {
    templates: data || [],
    isLoading,
    error,
    mutate, // for revalidation after add/edit/delete
  };
}
