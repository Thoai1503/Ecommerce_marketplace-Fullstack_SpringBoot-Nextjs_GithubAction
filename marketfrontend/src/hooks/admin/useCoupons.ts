import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsQuery } from '@/query/coupons';
import { createCoupon, updateCoupon, deleteCoupon } from '@/service/coupons';

export const useCoupons = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(couponsQuery.all());

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });

  return {
    coupons: data || [],
    isLoading,
    isError,
    refetch,
    deleteCoupon: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCouponDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(couponsQuery.detail(id));

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons', id] });
    },
  });

  return {
    coupon: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createCoupon: createMutation.mutateAsync,
    updateCoupon: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
