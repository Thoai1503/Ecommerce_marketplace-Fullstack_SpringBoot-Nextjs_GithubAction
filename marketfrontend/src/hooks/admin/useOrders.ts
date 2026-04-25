import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTracking,
  cancelOrder,
  refundOrder,
  updateShipmentStatus,
  updateOrderItems,
  OrderListParams,
  UpdateOrderItemPayload,
} from "@/service/orders";
import { OrderStatus, ShipmentStatus } from "@/types/index";

const LIST_KEY = ["admin", "orders", "list"] as const;
const DETAIL_KEY = ["admin", "orders", "detail"] as const;

export const useOrders = (params?: OrderListParams) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["admin", "orders", "list", params ?? {}],
    queryFn: () => getOrders(params),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
    queryClient.invalidateQueries({ queryKey: DETAIL_KEY });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: invalidateAll,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelOrder(id, reason),
    onSuccess: invalidateAll,
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      refundOrder(id, amount, reason),
    onSuccess: invalidateAll,
  });

  const trackingMutation = useMutation({
    mutationFn: ({
      id,
      trackingNumber,
      carrier,
      shipmentId,
    }: {
      id: string;
      trackingNumber: string;
      carrier?: string;
      shipmentId?: string | number;
    }) => updateTracking(id, { trackingNumber, carrier, shipmentId }),
    onSuccess: invalidateAll,
  });

  const shipmentStatusMutation = useMutation({
    mutationFn: ({ shipmentId, status }: { shipmentId: string; status: ShipmentStatus }) =>
      updateShipmentStatus(shipmentId, status),
    onSuccess: invalidateAll,
  });

  return {
    orders: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    size: data?.size ?? 20,
    totalPages: data?.totalPages ?? 1,
    statusStats: data?.statusStats ?? {},
    isLoading,
    isError,
    error,
    refetch,
    updateStatus: statusMutation.mutateAsync,
    cancelOrder: cancelMutation.mutateAsync,
    refundOrder: refundMutation.mutateAsync,
    updateTracking: trackingMutation.mutateAsync,
    updateShipmentStatus: shipmentStatusMutation.mutateAsync,
    isUpdating: statusMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isRefunding: refundMutation.isPending,
  };
};

export const useUpdateOrderItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      items,
      reason,
    }: {
      id: string;
      items: UpdateOrderItemPayload[];
      reason?: string;
    }) => updateOrderItems(id, items, reason),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", vars.id] });
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: DETAIL_KEY });
    },
  });
};

export const useOrderDetail = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "orders", "detail", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  const invalidateThis = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", id] });
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: OrderStatus; note?: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: invalidateThis,
  });
  const cancelMutation = useMutation({
    mutationFn: (reason: string) => cancelOrder(id, reason),
    onSuccess: invalidateThis,
  });
  const refundMutation = useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason: string }) =>
      refundOrder(id, amount, reason),
    onSuccess: invalidateThis,
  });
  const trackingMutation = useMutation({
    mutationFn: (payload: { trackingNumber: string; carrier?: string; shipmentId?: string | number }) =>
      updateTracking(id, payload),
    onSuccess: invalidateThis,
  });
  const shipmentStatusMutation = useMutation({
    mutationFn: ({ shipmentId, status }: { shipmentId: string; status: ShipmentStatus }) =>
      updateShipmentStatus(shipmentId, status),
    onSuccess: invalidateThis,
  });

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    cancelOrder: cancelMutation.mutateAsync,
    refundOrder: refundMutation.mutateAsync,
    updateTracking: trackingMutation.mutateAsync,
    updateShipmentStatus: shipmentStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isRefunding: refundMutation.isPending,
  };
};
