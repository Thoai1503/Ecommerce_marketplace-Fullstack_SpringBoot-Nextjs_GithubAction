import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vouchersQuery } from "@/query/vouchers";
import {
  createVoucher,
  deleteVoucher,
  saveVoucherRules,
  updateVoucher,
  updateVoucherStatus,
} from "@/service/vouchers";

export const useVouchers = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery(vouchersQuery.all());
  const campaignsQuery = useQuery(vouchersQuery.campaigns());
  const statsQuery = useQuery(vouchersQuery.stats());

  const deleteMutation = useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "voucher-stats"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      updateVoucherStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "voucher-stats"] });
    },
  });

  return {
    vouchers: listQuery.data || [],
    campaigns: campaignsQuery.data || [],
    stats: statsQuery.data,
    isLoading:
      listQuery.isLoading || campaignsQuery.isLoading || statsQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    deleteVoucher: deleteMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: statusMutation.isPending,
  };
};

export const useVoucherDetail = (id: string) => {
  const queryClient = useQueryClient();

  const detailQuery = useQuery(vouchersQuery.detail(id));
  const campaignsQuery = useQuery(vouchersQuery.campaigns());
  const redemptionsQuery = useQuery(vouchersQuery.redemptions(id));
  const auditsQuery = useQuery(vouchersQuery.audits(id));

  const createMutation = useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "voucher-stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "voucher-stats"] });
    },
  });

  return {
    voucher: detailQuery.data,
    campaigns: campaignsQuery.data || [],
    redemptions: redemptionsQuery.data || [],
    audits: auditsQuery.data || [],
    isLoading:
      detailQuery.isLoading ||
      campaignsQuery.isLoading ||
      redemptionsQuery.isLoading ||
      auditsQuery.isLoading,
    isError: detailQuery.isError,
    refetch: detailQuery.refetch,
    createVoucher: createMutation.mutateAsync,
    updateVoucher: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};

export const useVoucherRules = (id: string) => {
  const queryClient = useQueryClient();
  const rulesQuery = useQuery(vouchersQuery.rules(id));

  const saveMutation = useMutation({
    mutationFn: (payload: any) => saveVoucherRules(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "voucher-rules", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "voucher-audits", id],
      });
    },
  });

  return {
    rules: rulesQuery.data,
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    saveRules: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
