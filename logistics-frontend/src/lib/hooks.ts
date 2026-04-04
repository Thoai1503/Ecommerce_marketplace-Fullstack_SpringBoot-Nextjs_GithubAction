"use client";

import {
  useQuery,
  useMutation,
  keepPreviousData,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  getShipmentTimeline,
  getTracking,
  listShipments,
  updateShipmentStatus,
  PageResponse,
  Shipment,
  ShipmentStatusHistory,
  ShipmentStatus,
} from "./api";

export function useTracking(
  trackingCode: string,
): UseQueryResult<Shipment, Error> {
  return useQuery<Shipment, Error>({
    queryKey: ["tracking", trackingCode],
    queryFn: async (): Promise<Shipment> => {
      const res = await getTracking(trackingCode);
      return res.data;
    },
    enabled: Boolean(trackingCode),
  });
}

export function useShipmentTimeline(
  shipmentId?: number,
): UseQueryResult<ShipmentStatusHistory[], Error> {
  return useQuery<ShipmentStatusHistory[], Error>({
    queryKey: ["shipment-timeline", shipmentId],
    queryFn: async (): Promise<ShipmentStatusHistory[]> => {
      if (!shipmentId) {
        return [];
      }
      const res = await getShipmentTimeline(shipmentId);
      return res.data;
    },
    enabled: Boolean(shipmentId),
  });
}

export function useShipmentList(params?: {
  status?: ShipmentStatus;
  trackingCode?: string;
  shopRefId?: number;
  page?: number;
  size?: number;
}): UseQueryResult<PageResponse<Shipment>, Error> {
  return useQuery<PageResponse<Shipment>, Error>({
    queryKey: ["shipments", params],
    queryFn: async (): Promise<PageResponse<Shipment>> => {
      const res = await listShipments(params);
      return res.data;
    },
    placeholderData: keepPreviousData, // ✅ v5 replacement for keepPreviousData: true
  });
}
type UpdateStatusVariables = {
  orderShipmentRefId: number;
  status: ShipmentStatus;
};

export function useUpdateShipmentStatus() {
  return useMutation({
    mutationFn: ({ orderShipmentRefId, status }: UpdateStatusVariables) =>
      updateShipmentStatus(orderShipmentRefId, status),
  });
}
