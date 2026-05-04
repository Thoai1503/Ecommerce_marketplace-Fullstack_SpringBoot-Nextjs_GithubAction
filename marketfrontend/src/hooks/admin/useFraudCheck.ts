import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFraudCheck, rerunFraudCheck } from "@/services/productFraud";

export const useFraudCheck = (productId: string, enabled = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "products", productId, "fraud-check"],
    queryFn: () => getFraudCheck(productId),
    enabled: Boolean(productId) && enabled,
    staleTime: 60_000,
  });

  const rerunMutation = useMutation({
    mutationFn: () => rerunFraudCheck(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "products", productId, "fraud-check"], data);
    },
  });

  return {
    ...query,
    rerun: rerunMutation.mutateAsync,
    isRerunning: rerunMutation.isPending,
  };
};
