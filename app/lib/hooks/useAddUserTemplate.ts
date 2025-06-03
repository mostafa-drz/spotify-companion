import useSWRMutation from 'swr/mutation';
import type { PromptTemplate } from '@/app/types/Prompt';
import { addUserPromptTemplate } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';

export function useAddUserTemplate() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { trigger, error, isMutating } = useSWRMutation(
    ['user-templates', userId],
    (_, { arg }: { arg: PromptTemplate }) => {
      if (!userId) throw new Error('User not authenticated');
      return addUserPromptTemplate(userId, arg);
    }
  );

  return {
    addTemplate: trigger,
    error,
    isAdding: isMutating,
  };
} 