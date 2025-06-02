import useSWRMutation from 'swr/mutation';
import type { PromptTemplate } from '@/app/types/Prompt';
import { updateUserPromptTemplate } from '@/app/lib/firestore';

export function useUpdateUserTemplate(userId: string) {
  const { trigger, error, isMutating } = useSWRMutation(
    ['user-templates', userId],
    (_, { arg }: { arg: { templateId: string; updates: Partial<PromptTemplate> } }) => updateUserPromptTemplate(userId, arg.templateId, arg.updates)
  );

  return {
    updateTemplate: trigger,
    error,
    isUpdating: isMutating,
  };
} 