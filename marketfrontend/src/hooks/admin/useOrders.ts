import { useQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/query/orders";
import { Order } from "@/types";

interface UseOrdersOptions {
  /**
   * If true, fetches additional data (user info, address, items)
   * ⚠️  Slower but more complete
   * Default: false (fast list view)
   */
  enrichData?: boolean;
}

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  refetch: (options?: any) => any;
}

/**
 * Hook to fetch orders with optional data enrichment
 *
 * @param options.enrichData - If true, fetches user, address, items (slower)
 *
 * @example
 * // Fast list view (default)
 * const { orders } = useOrders();
 *
 * @example
 * // With enriched data (slower but complete)
 * const { orders } = useOrders({ enrichData: true });
 */
export const useOrders = (options: UseOrdersOptions = {}): UseOrdersReturn => {
  const { enrichData = false } = options;

  // Choose query based on enrichData flag
  const queryConfig = enrichData
    ? ordersQuery.allEnhanced()
    : ordersQuery.all();

  const { data, isLoading, isError, refetch } = useQuery(queryConfig);

  return {
    orders: data?.orders || [],
    isLoading,
    isError,
    refetch,
  };
};
