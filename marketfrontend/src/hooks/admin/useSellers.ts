
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellers, getSellerById, createSeller, updateSeller, deleteSellers, toggleSellerStatus } from '@/service/sellers';
import { SellerStatus } from '@/types/index';

export const useSellers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'sellers'],
    queryFn: getSellers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSellers,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SellerStatus }) => toggleSellerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      // Invalidate specific seller detail as well
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail'] });
    },
  });

  return {
    sellers: data || [],
    isLoading,
    isError,
    refetch,
    deleteSellers: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateStatus: statusMutation.mutateAsync,
  };
};

export const useSellerDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'sellers', 'detail', id],
    queryFn: () => getSellerById(id),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: createSeller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateSeller(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail', id] });
    },
  });

  return {
    seller: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createSeller: createMutation.mutateAsync,
    updateSeller: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
