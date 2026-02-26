
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProducts, approveProduct, rejectProduct, getProductById, duplicateProduct, updateProductStatus } from '@/service/products';
import { Product, ProductStatus } from '@/types/index';

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

  const duplicateMutation = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) => updateProductStatus(id, status),
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
    duplicateProduct: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
    updateProductStatus: updateStatusMutation.mutateAsync,
  };
};

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};
