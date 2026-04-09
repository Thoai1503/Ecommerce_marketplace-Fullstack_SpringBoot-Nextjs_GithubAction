import { queryOptions } from "@tanstack/react-query";
import { getOrders, getOrdersEnhanced } from "@/service/orders";

export const ordersQuery = {
  /**
   * Basic order list - fast, no related data
   * Use for: Quick list view with pagination
   */
  all: () =>
    queryOptions({
      queryKey: ["admin", "orders"],
      queryFn: () => getOrders(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    }),

  /**
   * Enhanced order list - includes user, address, items
   * Use for: Detail view, when displaying full information
   * ⚠️  Slower: Makes N+3 API calls where N = number of orders
   */
  allEnhanced: () =>
    queryOptions({
      queryKey: ["admin", "orders", "enhanced"],
      queryFn: () => getOrdersEnhanced(true),
      staleTime: 10 * 60 * 1000, // 10 minutes (longer as data is richer)
      gcTime: 20 * 60 * 1000, // 20 minutes
    }),

  /**
   * Single order by ID
   */
  byId: (id: string) =>
    queryOptions({
      queryKey: ["admin", "orders", id],
      queryFn: () =>
        getOrders().then((res) => res.orders?.find((o: any) => o.id === id)),
      staleTime: 5 * 60 * 1000,
    }),
};
