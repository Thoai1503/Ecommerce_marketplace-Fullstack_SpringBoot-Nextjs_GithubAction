
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellers, getSellerById, createSeller, updateSeller, deleteSellers, toggleSellerStatus, approveSeller, rejectSeller, blockSeller, unblockSeller, reopenSeller } from '@/service/sellers';
import { Seller, SellerStatus } from '@/types/index';

export const useSellers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<Seller[]>({
    queryKey: ['admin', 'sellers'],
    queryFn: () => getSellers(),
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

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail'] });
    },
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => blockSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail'] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => unblockSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
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
    approveSeller: approveMutation.mutateAsync,
    rejectSeller: rejectMutation.mutateAsync,
    blockSeller: blockMutation.mutateAsync,
    unblockSeller: unblockMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isBlocking: blockMutation.isPending,
    isUnblocking: unblockMutation.isPending,
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

  const approveMutation = useMutation({
    mutationFn: () => approveSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail', id] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => rejectSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail', id] });
    },
  });

  const blockMutation = useMutation({
    mutationFn: (reason: string) => blockSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail', id] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: () => unblockSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'detail', id] });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenSeller(id),
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
    approveSeller: approveMutation.mutateAsync,
    rejectSeller: rejectMutation.mutateAsync,
    blockSeller: blockMutation.mutateAsync,
    unblockSeller: unblockMutation.mutateAsync,
    reopenSeller: reopenMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isBlocking: blockMutation.isPending,
    isUnblocking: unblockMutation.isPending,
    isReopening: reopenMutation.isPending,
  };
};
