import useSWRMutation from 'swr/mutation';
import { deleteUser } from '@/app/actions/auth';

export function useDeleteUser() {
  const { trigger, error, isMutating } = useSWRMutation(
    'delete-user',
    async (_, { arg }: { arg: string }) => deleteUser(arg)
  );

  return {
    deleteUser: trigger,
    error,
    isDeleting: isMutating,
  };
}
