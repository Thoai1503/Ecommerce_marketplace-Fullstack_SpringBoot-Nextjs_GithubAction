"use client";

import {
  useQuery,
  useMutation,
  keepPreviousData,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  getTracking,
  listShipments,
  updateShipmentStatus,
  Shipment,
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

export function useShipmentList(params?: {
  status?: string;
  trackingCode?: string;
  shopId?: string;
}): UseQueryResult<Shipment[], Error> {
  return useQuery<Shipment[], Error>({
    queryKey: ["shipments", params],
    queryFn: async (): Promise<Shipment[]> => {
      const res = await listShipments(params);
      return res.data;
    },
    placeholderData: keepPreviousData, // ✅ v5 replacement for keepPreviousData: true
  });
}
type UpdateStatusVariables = { id: string; status: ShipmentStatus };

export function useUpdateShipmentStatus() {
  return useMutation({
    mutationFn: ({ id, status }: UpdateStatusVariables) =>
      updateShipmentStatus(id, status),
  });
}
