import { queryOptions } from "@tanstack/react-query";
import { getOrders, getOrderById, OrderListParams } from "@/service/orders";

export const ordersQuery = {
  all: (params?: OrderListParams) =>
    queryOptions({
      queryKey: ["admin", "orders", "list", params ?? {}],
      queryFn: () => getOrders(params),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["admin", "orders", "detail", id],
      queryFn: () => getOrderById(id),
      enabled: !!id,
    }),
};
