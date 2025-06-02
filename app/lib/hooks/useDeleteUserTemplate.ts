import useSWRMutation from 'swr/mutation';
import { deleteUserPromptTemplate } from '@/app/lib/firestore';

export function useDeleteUserTemplate(userId: string) {
  const { trigger, error, isMutating } = useSWRMutation(
    ['user-templates', userId],
    (_, { arg }: { arg: string }) => deleteUserPromptTemplate(userId, arg)
  );

  return {
    deleteTemplate: trigger,
    error,
    isDeleting: isMutating,
  };
} 