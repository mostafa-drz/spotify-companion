import useSWR from 'swr';
import type { PromptTemplate } from '@/app/types/Prompt';
import { getUserPromptTemplates } from '@/app/lib/firestore';

export function useUserTemplates(userId?: string) {
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