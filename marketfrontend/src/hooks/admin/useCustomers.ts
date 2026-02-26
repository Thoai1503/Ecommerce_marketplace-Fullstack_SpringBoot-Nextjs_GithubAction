
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, deleteCustomers, getCustomerById, getCustomerOrders, updateCustomer, toggleBlockStatus } from '@/service/customers';

export const useCustomers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: getCustomers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => toggleBlockStatus(id, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });

  return {
    customers: data || [],
    isLoading,
    isError,
    refetch,
    deleteCustomers: deleteMutation.mutateAsync,
    toggleBlockStatus: blockMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
};

export const useCustomerDetail = (id: string) => {
  const queryClient = useQueryClient();

  const customerQuery = useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

  const ordersQuery = useQuery({
    queryKey: ['admin', 'customers', id, 'orders'],
    queryFn: () => getCustomerOrders(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers', id] });
    }
  });

  return {
    customer: customerQuery.data,
    orders: ordersQuery.data || [],
    isLoading: customerQuery.isLoading || ordersQuery.isLoading,
    isError: customerQuery.isError || ordersQuery.isError,
    refetch: () => {
        customerQuery.refetch();
        ordersQuery.refetch();
    },
    updateCustomer: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
};
