import useSWRMutation from 'swr/mutation';
import type { PromptTemplate } from '@/app/types/Prompt';
import { addUserPromptTemplate } from '@/app/lib/firestore';

export function useAddUserTemplate(userId: string) {
  const { trigger, error, isMutating } = useSWRMutation(
    ['user-templates', userId],
    (_, { arg }: { arg: PromptTemplate }) => addUserPromptTemplate(userId, arg)
  );

  return {
    addTemplate: trigger,
    error,
    isAdding: isMutating,
  };
} 