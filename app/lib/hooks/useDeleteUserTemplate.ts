import useSWRMutation from 'swr/mutation';
import { deleteUserPromptTemplate } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';

export function useDeleteUserTemplate() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { trigger, error, isMutating } = useSWRMutation(
    ['user-templates', userId],
    (_, { arg }: { arg: string }) => {
      if (!userId) throw new Error('User not authenticated');
      return deleteUserPromptTemplate(userId, arg);
    }
  );

  return {
    deleteTemplate: trigger,
    error,
    isDeleting: isMutating,
  };
} 