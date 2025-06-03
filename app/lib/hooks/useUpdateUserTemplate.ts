import useSWRMutation from 'swr/mutation';
import type { PromptTemplate } from '@/app/types/Prompt';
import { updateUserPromptTemplate } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';

export function useUpdateUserTemplate() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { trigger, error, isMutating } = useSWRMutation(
    ['user-templates', userId],
    (_, { arg }: { arg: { templateId: string; updates: Partial<PromptTemplate> } }) => {
      if (!userId) throw new Error('User not authenticated');
      return updateUserPromptTemplate(userId, arg.templateId, arg.updates);
    }
  );

  return {
    updateTemplate: trigger,
    error,
    isUpdating: isMutating,
  };
} 