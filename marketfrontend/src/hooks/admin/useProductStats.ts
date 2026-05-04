import { useQuery } from "@tanstack/react-query";
import { getProductStats } from "@/services/productStats";

export const useProductStats = (productId: string, days: number, enabled = true) =>
  useQuery({
    queryKey: ["admin", "products", productId, "stats", days],
    queryFn: () => getProductStats(productId, days),
    enabled: Boolean(productId) && enabled,
    staleTime: 60_000,
  });
