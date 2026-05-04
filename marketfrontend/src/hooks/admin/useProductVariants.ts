'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as svc from '@/service/productVariant';
import { ProductVariant } from '@/types/index';

export function useProductVariants(productId: string | number | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['admin', 'products', productId, 'variants'];

  const { data: variants = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => svc.getVariantsByProduct(productId!),
    enabled: !!productId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (body: Partial<ProductVariant>) => svc.createVariant(productId!, body),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<ProductVariant> }) =>
      svc.updateVariant(productId!, id, body),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => svc.toggleVariant(productId!, id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => svc.deleteVariant(productId!, id),
    onSuccess: invalidate,
  });

  return {
    variants,
    isLoading,
    isError,
    refetch,
    createVariant: createMutation.mutateAsync,
    updateVariant: updateMutation.mutateAsync,
    toggleVariant: toggleMutation.mutateAsync,
    deleteVariant: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      toggleMutation.isPending ||
      deleteMutation.isPending,
  };
}
