import { axiosClient } from '@/lib/axios';
import { User, UserRole} from '@/validators/user';
import { PageResult } from '@/validators/pageResult';

export interface UserFilterParams {
  keyword?: string;
  userType?: string;
  isActive?: number; // 1: ACTIVE, 0: BLOCKED
  page: number;
  pageSize: number;
}

export const userService = {
  // Khớp với @GetMapping("/filter") của Backend
  filterUsers: async (params: UserFilterParams): Promise<PageResult<User>> => {
    const response = await axiosClient.get('/users/filter', { params });
    return response.data;
  },

  updateRole: async (userId: string, role: UserRole) => {
    return axiosClient.patch(`/users/${userId}/role`, { role });
  },

  // Chuyển đổi trạng thái từ string sang integer cho BE
  toggleStatus: async (userId: string, currentStatus: string) => {
    const isActive = currentStatus === 'ACTIVE' ? 0 : 1;
    return axiosClient.patch(`/users/${userId}/status`, { isActive });
  }
};