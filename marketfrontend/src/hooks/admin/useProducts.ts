import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProducts, approveProduct, rejectProduct, getProductById, duplicateProduct, updateProductStatus, createProduct, updateProduct, ProductPayload, getProductStatusHistory, trackProductView } from '@/service/products';
import { Product, ProductStatus } from '@/types/index';

interface UseProductsParams {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const useProducts = (params?: UseProductsParams) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => getProducts(params),
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
    mutationFn: ({ id, status, reason }: { id: string; status: ProductStatus; reason?: string }) => updateProductStatus(id, status, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', variables.id, 'history'] });
    },
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const statusHistoryQuery = useQuery({
    queryKey: ['admin', 'products', id, 'history'],
    queryFn: () => getProductStatusHistory(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id || !query.data) return;
    const timer = window.setTimeout(() => {
      trackProductView(id);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [id, query.data?.id]);

  const createMutation = useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ProductPayload>) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', id] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    statusHistory: statusHistoryQuery.data || [],
    isHistoryLoading: statusHistoryQuery.isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
