
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductsBySellerId, deleteProducts, approveProduct, rejectProduct, getProductById, updateProductActive } from '@/service/products';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: getProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProducts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const approveMutation = useMutation({
    mutationFn: approveProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectProduct(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateProductActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  return {
    products: data || [],
    isLoading,
    isError,
    refetch,
    deleteProducts: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    approveProduct: approveMutation.mutateAsync,
    rejectProduct: rejectMutation.mutateAsync,
    updateProductActive: updateStatusMutation.mutateAsync,
  };
};

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

export const useSellerProducts = (sellerId: string) => {
  const query = useQuery({
    queryKey: ['admin', 'products', 'seller', sellerId],
    queryFn: () => getProductsBySellerId(sellerId),
    enabled: !!sellerId,
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
