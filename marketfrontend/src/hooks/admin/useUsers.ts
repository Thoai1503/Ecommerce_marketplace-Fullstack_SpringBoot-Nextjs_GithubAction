
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersQuery } from '@/query/users';
import { updateUserRole, toggleUserStatus } from '@/service/users';
import { UserRole, UserStatus } from '@/types/index';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(usersQuery.all());

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => toggleUserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return {
    users: data || [],
    isLoading,
    isError,
    refetch,
    updateUserRole: roleMutation.mutateAsync,
    toggleUserStatus: statusMutation.mutateAsync,
    isUpdating: roleMutation.isPending || statusMutation.isPending,
  };
};
