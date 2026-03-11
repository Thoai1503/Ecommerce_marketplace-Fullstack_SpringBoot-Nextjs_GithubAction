import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UserFilterParams } from '@/services/user';
import { UserRole } from '@/validators/user';

// Hook lấy danh sách người dùng
export const useUsers = (filters: UserFilterParams) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.filterUsers(filters),
  });
};

// Hook thực hiện các hành động chỉnh sửa
export const useUserActions = () => {
  const queryClient = useQueryClient();

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userService.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      userService.toggleStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return { updateRole, toggleStatus };
};