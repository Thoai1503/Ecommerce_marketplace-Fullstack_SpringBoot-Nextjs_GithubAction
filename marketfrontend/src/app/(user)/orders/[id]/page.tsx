"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock3,
  CreditCard,
  Headset,
  Info,
  Lock,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Star,
} from "lucide-react";

import {
  AdjustmentItem,
  AdjustmentRequest,
  Order,
  OrderItem,
  ShipmentStatus,
} from "@/types";
import { API_URL } from "@/helper/api";

const orderStatusLabel: Record<Order["status"], string> = {
  PENDING: "Cho xac nhan",
  CONFIRMED: "Da xac nhan",
  PROCESSING: "Dang xu ly",
  SHIPPED: "Dang giao",
  COMPLETED: "Hoan thanh",
  CANCELED: "Da huy",
  REFUNDED: "Da hoan tien",
};

const shipmentStepOrder: ShipmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "SHIPPING",
  "DELIVERING",
  "DELIVERED",
  "COMPLETED",
];

const shipmentStepLabel: Record<ShipmentStatus, string> = {
  PENDING: "Cho xu ly",
  CONFIRMED: "Da xac nhan",
  PICKED_UP: "Da lay hang",
  SHIPPING: "Dang trung chuyen",
  DELIVERING: "Dang giao",
  DELIVERED: "Giao thanh cong",
  COMPLETED: "Da hoan thanh",
  FAILED: "Giao that bai",
  RETURNED: "Hoan ve",
};

const normalizePaymentStatus = (
  value: string | null | undefined,
): Order["paymentStatus"] => {
  const status = String(value || "").toUpperCase();
  if (status === "PAID") return "PAID";
  if (status === "REFUNDED") return "REFUNDED";
  return "UNPAID";
};

const normalizeOrderStatus = (
  value: string | null | undefined,
): Order["status"] => {
  const status = String(value || "").toUpperCase();
  const valid: Order["status"][] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELED",
    "REFUNDED",
  ];
  return valid.includes(status as Order["status"])
    ? (status as Order["status"])
    : "PENDING";
};

const normalizeShipmentStatus = (
  value: string | null | undefined,
): ShipmentStatus => {
  const status = String(value || "").toUpperCase();
  const map: Record<string, ShipmentStatus> = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PICKED_UP: "PICKED_UP",
    SHIPPING: "SHIPPING",
    IN_TRANSIT: "SHIPPING",
    DELIVERING: "DELIVERING",
    OUT_FOR_DELIVERY: "DELIVERING",
    DELIVERED: "DELIVERED",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    RETURNED: "RETURNED",
  };
  return map[status] || "PENDING";
};

const asNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const pickText = (...values: unknown[]) => {
  const found = values.find((v) => String(v ?? "").trim() !== "");
  return found == null ? "" : String(found);
};

// Validate and map adjustment request from API response
const mapAdjustmentRequest = (raw: any): AdjustmentRequest | undefined => {
  if (!raw) return undefined;

  // Validate required fields
  const id = String(raw?.id ?? raw?.adjustmentRequestId ?? "");
  const status = String(raw?.status ?? "").toUpperCase();

  // Check if it's a valid adjustment status
  const validStatuses = [
    "PENDING_BUYER",
    "ACCEPTED_BY_BUYER",
    "REJECTED_BY_BUYER",
    "CANCELLED_BY_SHOP",
    "EXPIRED",
  ];

  if (!id || !validStatuses.includes(status)) {
    console.warn("Invalid adjustment request data:", { id, status });
    return undefined;
  }

  try {
    // Map items and calculate totals
    const mappedItems: AdjustmentItem[] = Array.isArray(raw?.items)
      ? raw.items
          .map((item: any) => {
            const itemId = String(item?.id ?? item?.adjustmentItemId ?? "");
            if (!itemId) return null; // Skip invalid items

            return {
              id: itemId,
              order_item_id: String(
                item?.orderItemId ?? item?.order_item_id ?? "",
              ),
              product_id: String(item?.productId ?? item?.product_id ?? ""),
              variant_id: String(item?.variantId ?? item?.variant_id ?? ""),
              product_name: String(
                item?.productName ?? item?.product_name ?? "",
              ),
              variant_name:
                item?.variantName ?? item?.variant_name ?? undefined,
              old_quantity: asNumber(
                item?.oldQuantity ?? item?.old_quantity,
                0,
              ),
              new_quantity: asNumber(
                item?.newQuantity ?? item?.new_quantity,
                0,
              ),
              unit_price: asNumber(item?.unitPrice ?? item?.unit_price, 0),
              old_total: asNumber(item?.oldTotal ?? item?.old_total, 0),
              new_total: asNumber(item?.newTotal ?? item?.new_total, 0),
              diff_total: asNumber(item?.diffTotal ?? item?.diff_total, 0),
            };
          })
          .filter(Boolean)
      : [];

    // Calculate totals from items if API returns 0
    let totalOriginal = asNumber(
      raw?.totalOriginalAmount ?? raw?.total_original_amount,
      0,
    );
    let totalAdjusted = asNumber(
      raw?.totalAdjustedAmount ?? raw?.total_adjusted_amount,
      0,
    );
    let totalDiff = asNumber(raw?.totalDiffAmount ?? raw?.total_diff_amount, 0);

    // If API didn't provide totals, calculate from items
    if (totalOriginal === 0 && mappedItems.length > 0) {
      totalOriginal = mappedItems.reduce(
        (sum, item) => sum + item.old_total,
        0,
      );
      totalAdjusted = mappedItems.reduce(
        (sum, item) => sum + item.new_total,
        0,
      );
      totalDiff = mappedItems.reduce((sum, item) => sum + item.diff_total, 0);
    }

    return {
      id,
      request_code: String(raw?.requestCode ?? raw?.request_code ?? ""),
      order_shipment_id: String(
        raw?.orderShipmentId ?? raw?.order_shipment_id ?? "",
      ),
      order_id: String(raw?.orderId ?? raw?.order_id ?? ""),
      shop_id: String(raw?.shopId ?? raw?.shop_id ?? ""),
      status: status as any,
      shop_reason: raw?.shopReason ?? raw?.shop_reason ?? undefined,
      buyer_note: raw?.buyerNote ?? raw?.buyer_note ?? undefined,
      total_original_amount: totalOriginal,
      total_adjusted_amount: totalAdjusted,
      total_diff_amount: totalDiff,
      expires_at: raw?.expiresAt ?? raw?.expires_at ?? undefined,
      responded_at: raw?.respondedAt ?? raw?.responded_at ?? undefined,
      items: mappedItems,
      created_at: String(
        raw?.createdAt ?? raw?.created_at ?? new Date().toISOString(),
      ),
      updated_at: String(
        raw?.updatedAt ?? raw?.updated_at ?? new Date().toISOString(),
      ),
    };
  } catch (error) {
    console.error("Error mapping adjustment request:", error, raw);
    return undefined;
  }
};

const toOrderItem = (raw: any): OrderItem => ({
  id: String(raw?.id ?? raw?.itemId ?? ""),
  productName: pickText(raw?.productName, raw?.product_name, "San pham"),
  productImage: pickText(
    raw?.image,
    raw?.productImage,
    raw?.image_url,
    "/placeholder-product.png",
  ),
  sku: pickText(
    raw?.sku,
    raw?.variantSku,
    // Fallback to variant name or IDs if no SKU available
    raw?.variantName,
    raw?.variant_name,
    `P${raw?.productId || ""}-V${raw?.variantId || ""}`,
    "N/A",
  ),
  variant:
    pickText(raw?.variantName, raw?.variant_name, raw?.variant) || undefined,
  quantity: asNumber(raw?.quantity, 0),
  price: asNumber(raw?.price, 0),
  status: "Ready" as const,
});

const ensurePendingFirst = (history: any[] = []) => {
  const normalized = history
    .map((h) => ({
      status: normalizeShipmentStatus(h?.status ?? h?.newStatus),
      description:
        pickText(h?.description, h?.note, "Cap nhat trang thai") ||
        "Cap nhat trang thai",
      updatedAt: pickText(h?.updatedAt, h?.changedAt, new Date().toISOString()),
    }))
    .filter((h) => !!h.updatedAt);

  const pending = normalized.find((h) => h.status === "PENDING");
  const defaultPending = {
    status: "PENDING" as ShipmentStatus,
    description: pending?.description || "Cho xac nhan tu shop",
    updatedAt:
      pending?.updatedAt ||
      normalized[0]?.updatedAt ||
      new Date().toISOString(),
  };

  if (!normalized.length) return [defaultPending];
  if (normalized[0].status === "PENDING") {
    return [
      {
        ...normalized[0],
        description: normalized[0].description || "Cho xac nhan tu shop",
      },
      ...normalized.slice(1),
    ];
  }
  return [defaultPending, ...normalized.filter((h) => h !== pending)];
};

const buildAddress = (recipient: any) =>
  [
    recipient?.addressLine,
    recipient?.ward,
    recipient?.district,
    recipient?.city,
  ]
    .filter(Boolean)
    .join(", ");

const fetchJson = async <T,>(path: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return res.json();
};

const getFirstSuccess = async <T,>(paths: string[]): Promise<T | null> => {
  for (const path of paths) {
    try {
      return await fetchJson<T>(path);
    } catch {
      // try next path
    }
  }
  return null;
};

const formatMoney = (amount: number) => `${amount.toLocaleString("vi-VN")}d`;

const formatDate = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    hour12: false,
  });

const stepNumberBase: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "2px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 800,
  flexShrink: 0,
};

const cardBase: CSSProperties = {
  background: "white",
  borderRadius: 8,
  boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
  borderLeft: "4px solid",
  padding: 16,
  overflow: "hidden",
};

const styles: Record<string, CSSProperties> = {
  cardCompleted: {
    ...cardBase,
    borderLeftColor: "#22c55e",
    background: "rgba(34,197,94,0.04)",
  },
  cardActive: {
    ...cardBase,
    borderLeftColor: "#137fec",
    boxShadow:
      "0 4px 12px rgba(19,127,236,0.12), 0 0 0 1px rgba(19,127,236,0.15)",
  },
  cardDefault: {
    ...cardBase,
    borderLeftColor: "#e2e8f0",
  },
  stepDone: {
    ...stepNumberBase,
    borderColor: "#22c55e",
    background: "#22c55e",
    color: "white",
  },
  stepActive: {
    ...stepNumberBase,
    borderColor: "#137fec",
    color: "#137fec",
  },
  productImg: {
    width: 72,
    height: 72,
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    objectFit: "cover",
    background: "#f8fafc",
    flexShrink: 0,
  },
  qtyBadge: {
    fontSize: 10,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: 4,
  },
  shipmentItem: {
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    background: "white",
  },
  shipmentHead: {
    background: "#f8fafc",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  timelineChipDone: {
    background: "rgba(34,197,94,0.1)",
    color: "#16a34a",
    fontWeight: 700,
    fontSize: 11,
  },
  timelineChipPending: {
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 700,
    fontSize: 11,
  },
  summaryCard: {
    background: "white",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  summaryHeader: {
    padding: "18px 20px",
    borderBottom: "1px solid #f8fafc",
  },
  itemsBadge: {
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "2px 8px",
    borderRadius: 4,
  },
  btnOrder: {
    width: "100%",
    background: "#137fec",
    color: "white",
    fontWeight: 800,
    fontSize: 13,
    border: "none",
    borderRadius: 10,
    padding: 14,
    boxShadow: "0 4px 14px rgba(19,127,236,0.25)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    lineHeight: 1.2,
  },
  btnSecondary: {
    width: "100%",
    background: "white",
    color: "#137fec",
    fontWeight: 800,
    fontSize: 12,
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
  },
  infoNote: {
    background: "rgba(241,245,249,0.6)",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
  },
};

export default function UserOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustmentActionStatus, setAdjustmentActionStatus] = useState<
    Record<string, "idle" | "pending" | "accepted" | "rejected">
  >({});
  const [adjustmentActionMessage, setAdjustmentActionMessage] = useState<
    Record<string, string>
  >({});
  const [receiveActionStatus, setReceiveActionStatus] = useState<
    Record<string, "idle" | "pending">
  >({});
  const [receiveActionMessage, setReceiveActionMessage] = useState<
    Record<string, string>
  >({});

  const markShipmentAsCompletedLocal = (shipmentId: string, note: string) => {
    setOrder((prev) => {
      if (!prev) return prev;

      const now = new Date().toISOString();
      const targetShipment = prev.shipments?.find((s) => s.id === shipmentId);

      return {
        ...prev,
        shipments: prev.shipments?.map((shipment) => {
          if (shipment.id !== shipmentId) return shipment;

          const alreadyCompleted = (shipment.statusHistory || []).some(
            (h) => h.status === "COMPLETED",
          );

          return {
            ...shipment,
            shipping_status: "COMPLETED",
            updated_at: now,
            statusHistory: alreadyCompleted
              ? shipment.statusHistory
              : [
                  ...(shipment.statusHistory || []),
                  {
                    status: "COMPLETED",
                    description: note,
                    updatedAt: now,
                  },
                ],
          };
        }),
        logs: [
          ...(prev.logs || []),
          {
            id: `${shipmentId}-completed-${Date.now()}`,
            action: "SHIPMENT_COMPLETED",
            note: `${targetShipment?.shopName || "Shipment"}: ${note}`,
            performedBy: "buyer",
            createdAt: now,
          },
        ].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      };
    });
  };

  const handleConfirmReceived = async (shipmentId: string) => {
    setReceiveActionStatus((prev) => ({
      ...prev,
      [shipmentId]: "pending",
    }));

    let confirmedByApi = false;

    const attempts: Array<{ path: string; method: "POST" | "PATCH" }> = [
      {
        path: `/api/orders/shipments/${shipmentId}/confirm-received`,
        method: "POST",
      },
      {
        path: `/api/orders/shipments/${shipmentId}/complete`,
        method: "POST",
      },
      {
        path: `/api/orders/shipments/${shipmentId}/status`,
        method: "PATCH",
      },
      {
        path: `/api/orders/shipments/${shipmentId}`,
        method: "PATCH",
      },
    ];

    try {
      for (const attempt of attempts) {
        const response = await fetch(`${API_URL}${attempt.path}`, {
          method: attempt.method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shippingStatus: "COMPLETED" }),
        });

        if (response.ok) {
          confirmedByApi = true;
          break;
        }
      }

      setReceiveActionMessage((prev) => ({
        ...prev,
        [shipmentId]: confirmedByApi
          ? "Ban da xac nhan da nhan hang."
          : "Da cap nhat tam thoi tren giao dien. Neu backend chua ho tro endpoint, vui long kiem tra lai sau.",
      }));
    } catch (error) {
      console.error("Confirm received failed:", error);
      setReceiveActionMessage((prev) => ({
        ...prev,
        [shipmentId]:
          "Da cap nhat tam thoi tren giao dien. Neu backend chua ho tro endpoint, vui long kiem tra lai sau.",
      }));
    } finally {
      markShipmentAsCompletedLocal(
        shipmentId,
        "Nguoi mua da xac nhan da nhan hang",
      );
      setReceiveActionStatus((prev) => ({
        ...prev,
        [shipmentId]: "idle",
      }));
    }
  };

  const handleAdjustmentDecision = async (
    shipmentId: string,
    requestId: string,
    decision: "accepted" | "rejected",
  ) => {
    setAdjustmentActionStatus((prev) => ({
      ...prev,
      [shipmentId]: "pending",
    }));

    const newStatus =
      decision === "accepted" ? "ACCEPTED_BY_BUYER" : "REJECTED_BY_BUYER";

    try {
      // Use POST method with proper URL pattern
      const response = await fetch(
        `${API_URL}/api/orders/${id}/shipments/${shipmentId}/adjustment-request/${requestId}/${decision}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // Empty body for now, backend may not need it
        },
      );

      if (!response.ok) {
        alert(`HTTP ${response.status}: ${response.statusText}`);

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setAdjustmentActionMessage((prev) => ({
        ...prev,
        [shipmentId]:
          decision === "accepted"
            ? "Bạn đã chấp nhận yêu cầu điều chỉnh."
            : "Bạn đã từ chối yêu cầu điều chỉnh.",
      }));
    } catch (error) {
      console.error("Adjustment decision failed:", error);
      setAdjustmentActionMessage((prev) => ({
        ...prev,
        [shipmentId]:
          "Đã cập nhật trạng thái tạm thời. Nếu backend chưa hỗ trợ hành động này, vui lòng kiểm tra lại sau.",
      }));
    } finally {
      setAdjustmentActionStatus((prev) => ({
        ...prev,
        [shipmentId]: "idle",
      }));
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              shipments: prev.shipments?.map((shipment) =>
                shipment.id !== shipmentId
                  ? shipment
                  : {
                      ...shipment,
                      adjustment_request: shipment.adjustment_request
                        ? {
                            ...shipment.adjustment_request,
                            status: newStatus as
                              | "ACCEPTED_BY_BUYER"
                              | "REJECTED_BY_BUYER",
                            responded_at: new Date().toISOString(),
                          }
                        : shipment.adjustment_request,
                    },
              ),
            }
          : prev,
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      setLoading(true);
      try {
        const baseOrder = await getFirstSuccess<any>([`/api/orders/${id}`]);

        if (!baseOrder) {
          if (!mounted) return;
          setOrder(null);
          setLoading(false);
          return;
        }

        const orderData = baseOrder?.order ?? baseOrder;

        const rawItems =
          (await getFirstSuccess<any[]>([`/api/orders/${id}/items`])) ||
          orderData?.items ||
          [];

        const seedShipments: any[] = Array.isArray(orderData?.shipments)
          ? orderData.shipments
          : Array.isArray(orderData?.order_shipment)
            ? orderData.order_shipment
            : Array.isArray(orderData?.orderShipments)
              ? orderData.orderShipments
              : [];

        // Extract shipment IDs - handle both 'id' and 'shipmentId' fields
        const shipmentIdMap = new Map<number, any>();
        seedShipments.forEach((s) => {
          const sid = asNumber(s?.id ?? s?.shipmentId ?? s?.shipment_id, 0);
          if (sid > 0) {
            shipmentIdMap.set(sid, s); // Store original shipment data
          }
        });

        // Also extract from items if shipmentId is there
        rawItems.forEach((item: any) => {
          const sid = asNumber(item?.shipmentId ?? item?.shipment_id, 0);
          if (sid > 0 && !shipmentIdMap.has(sid)) {
            shipmentIdMap.set(sid, {});
          }
        });

        const shipmentDetails = await Promise.all(
          Array.from(shipmentIdMap.entries()).map(
            async ([shipmentId, seedData]) => {
              const detail = await getFirstSuccess<any>([
                `/api/orders/shipments/${shipmentId}`,
              ]);
              return { shipmentId, seedData, detail };
            },
          ),
        );

        const shipments = await Promise.all(
          shipmentDetails
            .filter((s) => s.detail)
            .map(async ({ shipmentId, seedData, detail: raw }) => {
              const shipment = raw || {};
              const recipient = shipment?.recipient || {};
              const items = Array.isArray(shipment?.items)
                ? shipment.items
                : [];

              // Use businessStatus from either seed data or detail, prefer seed data
              let business_status =
                seedData?.businessStatus ||
                shipment?.businessStatus ||
                "NORMAL";
              const adjustment_required =
                seedData?.adjustmentRequired ||
                shipment?.adjustmentRequired ||
                false;

              // Fetch adjustment request if exists
              let adjustmentRequest: AdjustmentRequest | undefined;

              if (adjustment_required || business_status !== "NORMAL") {
                try {
                  const adjustData = await fetchJson<any>(
                    `/api/orders/shipments/${shipmentId}/adjustment-request`,
                  );
                  adjustmentRequest = mapAdjustmentRequest(adjustData);
                } catch (error) {
                  console.warn(
                    `Failed to fetch adjustment request for shipment ${shipmentId}:`,
                    error,
                  );
                }
              }

              return {
                id: String(shipmentId),
                order_id: String(shipment?.orderId ?? shipment?.order_id ?? id),
                shop_id: String(
                  seedData?.shopId ||
                    shipment?.shopId ||
                    shipment?.shop_id ||
                    "",
                ),
                shopName: pickText(
                  shipment?.shopName,
                  `Shop #${seedData?.shopId || shipment?.shopId || "-"}`,
                ),
                tracking_number: pickText(
                  seedData?.trackingNumber ||
                    shipment?.trackingNumber ||
                    shipment?.tracking_number,
                ),
                carrier_name:
                  pickText(
                    seedData?.carrierName ||
                      shipment?.carrierName ||
                      shipment?.carrier_name,
                  ) || undefined,
                shipping_status: normalizeShipmentStatus(
                  seedData?.shippingStatus ||
                    shipment?.shippingStatus ||
                    shipment?.shipping_status,
                ),
                estimated_delivery_at:
                  pickText(
                    shipment?.estimatedDeliveryAt,
                    shipment?.estimated_delivery_at,
                  ) || undefined,
                created_at: pickText(
                  seedData?.createdAt ||
                    shipment?.createdAt ||
                    shipment?.created_at ||
                    orderData?.createdAt ||
                    new Date().toISOString(),
                ),
                updated_at: pickText(
                  seedData?.updatedAt ||
                    shipment?.updatedAt ||
                    shipment?.updated_at ||
                    orderData?.updatedAt ||
                    new Date().toISOString(),
                ),
                shipping_fee: asNumber(
                  seedData?.shippingFee ||
                    shipment?.shippingFee ||
                    seedData?.shipping_fee ||
                    shipment?.shipping_fee,
                  0,
                ),
                items: items.map(toOrderItem),
                statusHistory: ensurePendingFirst(shipment?.statusHistory),
                recipient,
                adjustment_request: adjustmentRequest,
                adjustment_required,
                business_status,
              };
            }),
        );

        const fallbackItems = rawItems.map(toOrderItem);
        const orderItems: OrderItem[] =
          shipments.flatMap((s: any) => s.items || []).length > 0
            ? shipments.flatMap((s: any) => s.items || [])
            : fallbackItems;

        const uniqueItems: OrderItem[] = Array.from(
          new Map(
            orderItems.map((item: OrderItem) => [item.id, item]),
          ).values(),
        );

        const firstRecipient = shipments[0]?.recipient;
        const shippingAddress =
          buildAddress(firstRecipient) ||
          pickText(
            orderData?.shippingAddress,
            orderData?.address,
            orderData?.addressLine,
          );

        const logs = shipments
          .flatMap((s: any) =>
            (s.statusHistory || []).map((h: any, idx: number) => ({
              id: `${s.id}-${idx}`,
              action: `SHIPMENT_${h.status}`,
              note: `${s.shopName}: ${h.description || "Cap nhat trang thai"}`,
              createdAt: h.updatedAt,
            })),
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        const mappedOrder: Order = {
          id: String(orderData?.orderId ?? orderData?.id ?? id),
          orderCode: pickText(
            orderData?.orderNumber,
            orderData?.orderCode,
            `ORD-${id}`,
          ),
          customerName: pickText(
            firstRecipient?.recipientName,
            orderData?.customerName,
            "Khach hang",
          ),
          customerEmail: pickText(orderData?.customerEmail),
          customerPhone: pickText(
            firstRecipient?.recipientPhone,
            orderData?.customerPhone,
            "-",
          ),
          shippingAddress: shippingAddress || "-",
          totalAmount: asNumber(
            orderData?.finalAmount ?? orderData?.totalAmount,
            0,
          ),
          subtotalAmount: asNumber(orderData?.totalAmount, 0),
          discountAmount: asNumber(orderData?.discountAmount, 0),
          shippingAmount:
            asNumber(orderData?.shippingFee, NaN) ||
            shipments.reduce(
              (sum: number, s: any) => sum + asNumber(s.shipping_fee, 0),
              0,
            ),
          taxAmount: asNumber(orderData?.taxAmount, 0),
          itemsCount: uniqueItems.length,
          paymentStatus: normalizePaymentStatus(orderData?.paymentStatus),
          paymentMethod: pickText(orderData?.paymentMethod, "cod"),
          transactionId: pickText(orderData?.transactionId),
          deliveryNumber: pickText(orderData?.trackingNumber),
          trackingNumber: pickText(orderData?.trackingNumber),
          status: normalizeOrderStatus(orderData?.orderStatus),
          priority: "NORMAL",
          createdAt: pickText(orderData?.createdAt, new Date().toISOString()),
          updatedAt: pickText(orderData?.updatedAt, new Date().toISOString()),
          items: uniqueItems,
          shipments: shipments.map(({ recipient, ...s }: any) => s),
          logs,
          internalNote: pickText(orderData?.note) || undefined,
        };

        if (!mounted) return;
        setOrder(mappedOrder);
      } catch {
        if (!mounted) return;
        setOrder(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadOrder();
    return () => {
      mounted = false;
    };
  }, [id]);

  const statusChipClass = useMemo(() => {
    if (!order) return "bg-slate-100 text-slate-600";

    if (order.status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
    if (order.status === "SHIPPED") return "bg-blue-100 text-blue-700";
    if (order.status === "PENDING") return "bg-amber-100 text-amber-700";
    if (order.status === "CANCELED" || order.status === "REFUNDED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-indigo-100 text-indigo-700";
  }, [order]);

  if (loading) {
    return (
      <div className="container-xl py-5 d-flex flex-column align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-secondary fw-semibold mb-0">
          Dang tai chi tiet don hang...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-xl py-5 text-center">
        <h2 className="fw-bold mb-2">Khong tim thay don hang</h2>
        <p className="text-secondary mb-4">
          Vui long kiem tra lai ma don hoac quay ve trang chu.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn btn-primary px-4"
        >
          Ve trang chu
        </button>
      </div>
    );
  }

  return (
    <main className="flex-grow-1 py-4 py-md-5">
      <div className="container-xl px-3 px-md-4">
        <section style={styles.cardActive} className="mb-4">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <h2
                style={{ fontWeight: 800, fontSize: "1.35rem" }}
                className="mb-1"
              >
                Chi tiet don hang {order.orderCode}
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                Theo doi tien trinh don hang va thong tin giao nhan cua ban.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-light border d-inline-flex align-items-center gap-2"
            >
              <ArrowLeft size={16} /> Quay lai
            </button>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <span className="badge text-bg-light border text-dark px-3 py-2">
              Ma don: {order.orderCode}
            </span>
            <span className="badge text-bg-light border text-dark px-3 py-2">
              Trang thai don hang
            </span>
            <span className={`badge px-3 py-2 ${statusChipClass}`}>
              {orderStatusLabel[order.status]}
            </span>
            <span
              className={`badge px-3 py-2 ${order.paymentStatus === "PAID" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
            >
              {order.paymentStatus === "PAID"
                ? "Da thanh toan"
                : "Chua thanh toan"}
            </span>
          </div>
        </section>

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-7">
            <div className="d-flex flex-column gap-3">
              <section style={styles.cardCompleted}>
                <div className="d-flex gap-3">
                  <div style={styles.stepDone}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="flex-grow-1">
                    <h3
                      style={{ fontSize: 13, fontWeight: 700 }}
                      className="mb-2"
                    >
                      San pham trong don
                    </h3>

                    {order.items?.map((item, index) => (
                      <div key={item.id}>
                        <div className="d-flex gap-3 py-2">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            style={styles.productImg}
                          />
                          <div className="flex-grow-1 d-flex flex-column justify-content-center">
                            <h4
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                lineHeight: 1.4,
                                color: "#1e293b",
                              }}
                              className="mb-1"
                            >
                              {item.productName}
                            </h4>
                            <p
                              className="text-muted mb-2"
                              style={{ fontSize: 11 }}
                            >
                              SKU: {item.sku}
                              {item.variant ? ` | ${item.variant}` : ""}
                            </p>
                            <div className="d-flex align-items-center justify-content-between">
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: "#137fec",
                                }}
                              >
                                {formatMoney(item.price)}
                              </span>
                              <span style={styles.qtyBadge}>
                                So luong:{" "}
                                {String(item.quantity).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {index < (order.items?.length || 0) - 1 && (
                          <hr
                            className="my-3"
                            style={{ borderColor: "#f1f5f9" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section style={styles.cardActive}>
                <div className="d-flex gap-3">
                  <div style={styles.stepActive}>2</div>
                  <div className="flex-grow-1">
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                      className="mb-3"
                    >
                      Van chuyen ({order.shipments?.length || 0} kien)
                    </h3>

                    <div className="d-flex flex-column gap-3">
                      {order.shipments?.map((shipment) => {
                        const currentStep = shipmentStepOrder.indexOf(
                          shipment.shipping_status,
                        );
                        const adjustmentRequest = shipment.adjustment_request;

                        return (
                          <div key={shipment.id} style={styles.shipmentItem}>
                            <div style={styles.shipmentHead}>
                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <p
                                  className="mb-1 fw-bold"
                                  style={{ fontSize: 13 }}
                                >
                                  {shipment.shopName}
                                </p>
                                {adjustmentRequest && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "4px 8px",
                                      borderRadius: 999,
                                      background:
                                        adjustmentRequest.status ===
                                        "PENDING_BUYER"
                                          ? "#fef3c7"
                                          : adjustmentRequest.status ===
                                              "ACCEPTED_BY_BUYER"
                                            ? "#dcfce7"
                                            : adjustmentRequest.status ===
                                                "REJECTED_BY_BUYER"
                                              ? "#fee2e2"
                                              : "#e2e8f0",
                                      color:
                                        adjustmentRequest.status ===
                                        "PENDING_BUYER"
                                          ? "#92400e"
                                          : adjustmentRequest.status ===
                                              "ACCEPTED_BY_BUYER"
                                            ? "#166534"
                                            : adjustmentRequest.status ===
                                                "REJECTED_BY_BUYER"
                                              ? "#b91c1c"
                                              : "#475569",
                                    }}
                                  >
                                    {adjustmentRequest.status ===
                                    "PENDING_BUYER"
                                      ? "Yêu cầu chỉnh sửa"
                                      : adjustmentRequest.status ===
                                          "ACCEPTED_BY_BUYER"
                                        ? "Đã chấp nhận"
                                        : adjustmentRequest.status ===
                                            "REJECTED_BY_BUYER"
                                          ? "Đã từ chối"
                                          : "Đã điều chỉnh"}
                                  </span>
                                )}
                              </div>
                              <p
                                className="mb-0 text-muted"
                                style={{ fontSize: 11 }}
                              >
                                Ma van don:{" "}
                                {shipment.tracking_number || "Dang cap nhat"}
                              </p>
                            </div>

                            <div style={{ padding: "14px 16px" }}>
                              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                                <div className="d-flex flex-wrap gap-2">
                                  {shipmentStepOrder.map((step, idx) => {
                                    const done = currentStep >= idx;
                                    return (
                                      <span
                                        key={`${shipment.id}-${step}`}
                                        className="badge rounded-pill px-3 py-2"
                                        style={
                                          done
                                            ? styles.timelineChipDone
                                            : styles.timelineChipPending
                                        }
                                      >
                                        {shipmentStepLabel[step]}
                                      </span>
                                    );
                                  })}
                                </div>

                                {(shipment.shipping_status === "DELIVERED" ||
                                  shipment.shipping_status === "COMPLETED") && (
                                  <div className="d-flex align-items-center gap-2 ms-auto">
                                    {shipment.shipping_status ===
                                    "DELIVERED" ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleConfirmReceived(shipment.id)
                                        }
                                        disabled={
                                          receiveActionStatus[shipment.id] ===
                                          "pending"
                                        }
                                        className="btn btn-success btn-sm"
                                      >
                                        {receiveActionStatus[shipment.id] ===
                                        "pending"
                                          ? "Dang xac nhan..."
                                          : "TÔI ĐÃ NHẬN ĐƯỢC HÀNG"}
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                                      >
                                        <Star size={14} />
                                        Đánh giá sản phẩm
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {shipment.shipping_status === "DELIVERED" &&
                                receiveActionMessage[shipment.id] && (
                                  <p
                                    className="text-secondary mb-3"
                                    style={{ fontSize: 11 }}
                                  >
                                    {receiveActionMessage[shipment.id]}
                                  </p>
                                )}

                              {/* Adjustment Request Alert */}
                              {adjustmentRequest && (
                                <div
                                  style={{
                                    background:
                                      adjustmentRequest.status ===
                                      "PENDING_BUYER"
                                        ? "rgba(245, 158, 11, 0.08)"
                                        : adjustmentRequest.status ===
                                            "ACCEPTED_BY_BUYER"
                                          ? "rgba(34, 197, 94, 0.08)"
                                          : adjustmentRequest.status ===
                                              "REJECTED_BY_BUYER"
                                            ? "rgba(239, 68, 68, 0.08)"
                                            : "rgba(107, 114, 128, 0.08)",
                                    border:
                                      adjustmentRequest.status ===
                                      "PENDING_BUYER"
                                        ? "1px solid #fbbf24"
                                        : adjustmentRequest.status ===
                                            "ACCEPTED_BY_BUYER"
                                          ? "1px solid #22c55e"
                                          : adjustmentRequest.status ===
                                              "REJECTED_BY_BUYER"
                                            ? "1px solid #ef4444"
                                            : "1px solid #9ca3af",
                                    borderRadius: 8,
                                    padding: 14,
                                    marginBottom: 16,
                                  }}
                                >
                                  <div className="d-flex gap-3 align-items-start mb-3">
                                    <div
                                      style={{
                                        background:
                                          adjustmentRequest.status ===
                                          "PENDING_BUYER"
                                            ? "#fbbf24"
                                            : adjustmentRequest.status ===
                                                "ACCEPTED_BY_BUYER"
                                              ? "#22c55e"
                                              : adjustmentRequest.status ===
                                                  "REJECTED_BY_BUYER"
                                                ? "#ef4444"
                                                : "#9ca3af",
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {adjustmentRequest.status ===
                                      "ACCEPTED_BY_BUYER" ? (
                                        <Check
                                          size={14}
                                          color="white"
                                          strokeWidth={3}
                                        />
                                      ) : adjustmentRequest.status ===
                                        "REJECTED_BY_BUYER" ? (
                                        <span
                                          style={{
                                            color: "white",
                                            fontSize: 14,
                                            fontWeight: "bold",
                                          }}
                                        >
                                          ✕
                                        </span>
                                      ) : (
                                        <Info
                                          size={14}
                                          color="white"
                                          strokeWidth={2}
                                        />
                                      )}
                                    </div>
                                    <div className="flex-grow-1">
                                      <p
                                        className="fw-bold mb-1"
                                        style={{
                                          fontSize: 13,
                                          color:
                                            adjustmentRequest.status ===
                                            "PENDING_BUYER"
                                              ? "#92400e"
                                              : adjustmentRequest.status ===
                                                  "ACCEPTED_BY_BUYER"
                                                ? "#166534"
                                                : adjustmentRequest.status ===
                                                    "REJECTED_BY_BUYER"
                                                  ? "#991b1b"
                                                  : "#374151",
                                        }}
                                      >
                                        {adjustmentRequest.status ===
                                        "PENDING_BUYER"
                                          ? "Yêu cầu chỉnh sửa số lượng"
                                          : adjustmentRequest.status ===
                                              "ACCEPTED_BY_BUYER"
                                            ? "Yêu cầu đã được chấp nhận"
                                            : adjustmentRequest.status ===
                                                "REJECTED_BY_BUYER"
                                              ? "Yêu cầu đã bị từ chối"
                                              : "Yêu cầu chỉnh sửa hủy"}
                                      </p>
                                      <p
                                        className="mb-2"
                                        style={{
                                          fontSize: 12,
                                          color:
                                            adjustmentRequest.status ===
                                            "PENDING_BUYER"
                                              ? "#b45309"
                                              : adjustmentRequest.status ===
                                                  "ACCEPTED_BY_BUYER"
                                                ? "#15803d"
                                                : adjustmentRequest.status ===
                                                    "REJECTED_BY_BUYER"
                                                  ? "#b91c1c"
                                                  : "#6b7280",
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        {adjustmentRequest.shop_reason ||
                                          "Shop đã gửi yêu cầu chỉnh sửa số lượng"}
                                      </p>
                                      <div className="d-flex flex-wrap gap-2 mb-2">
                                        <span
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background:
                                              adjustmentRequest.status ===
                                              "PENDING_BUYER"
                                                ? "#fef3c7"
                                                : "#f0fdf4",
                                            color:
                                              adjustmentRequest.status ===
                                              "PENDING_BUYER"
                                                ? "#b45309"
                                                : "#166534",
                                            padding: "4px 8px",
                                            borderRadius: 4,
                                          }}
                                        >
                                          Mã: {adjustmentRequest.request_code}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background:
                                              adjustmentRequest.status ===
                                              "PENDING_BUYER"
                                                ? "#fef3c7"
                                                : "#f0fdf4",
                                            color:
                                              adjustmentRequest.status ===
                                              "PENDING_BUYER"
                                                ? "#b45309"
                                                : "#166534",
                                            padding: "4px 8px",
                                            borderRadius: 4,
                                          }}
                                        >
                                          Chênh lệch:{" "}
                                          {formatMoney(
                                            adjustmentRequest.total_diff_amount,
                                          )}
                                        </span>
                                        {adjustmentRequest.expires_at &&
                                          adjustmentRequest.status ===
                                            "PENDING_BUYER" && (
                                            <span
                                              style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                background: "#fef3c7",
                                                color: "#b45309",
                                                padding: "4px 8px",
                                                borderRadius: 4,
                                              }}
                                            >
                                              Hết hạn:{" "}
                                              {formatDate(
                                                adjustmentRequest.expires_at,
                                              )}
                                            </span>
                                          )}
                                      </div>

                                      {/* Adjustment Items Details */}
                                      {adjustmentRequest.items &&
                                        adjustmentRequest.items.length > 0 && (
                                          <div
                                            className="mb-3"
                                            style={{
                                              borderTop: "1px solid",
                                              borderColor:
                                                adjustmentRequest.status ===
                                                "PENDING_BUYER"
                                                  ? "#fbbf24"
                                                  : "#22c55e",
                                              paddingTop: 10,
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.04em",
                                                marginBottom: 8,
                                              }}
                                            >
                                              Chi tiết chỉnh sửa
                                            </p>
                                            <div className="d-flex flex-column gap-2">
                                              {adjustmentRequest.items.map(
                                                (adjItem) => (
                                                  <div
                                                    key={adjItem.id}
                                                    className="rounded-2 p-2"
                                                    style={{
                                                      background:
                                                        adjustmentRequest.status ===
                                                        "PENDING_BUYER"
                                                          ? "rgba(251, 191, 36, 0.05)"
                                                          : "rgba(34, 197, 94, 0.05)",
                                                      border: "1px solid",
                                                      borderColor:
                                                        adjustmentRequest.status ===
                                                        "PENDING_BUYER"
                                                          ? "#fbbf24"
                                                          : "#22c55e",
                                                    }}
                                                  >
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                      <span
                                                        style={{
                                                          fontSize: 12,
                                                          fontWeight: 700,
                                                        }}
                                                      >
                                                        {adjItem.product_name}
                                                      </span>
                                                      <span
                                                        style={{
                                                          fontSize: 11,
                                                          fontWeight: 700,
                                                          background:
                                                            adjustmentRequest.status ===
                                                            "PENDING_BUYER"
                                                              ? "#fef3c7"
                                                              : "#dcfce7",
                                                          padding: "2px 6px",
                                                          borderRadius: 3,
                                                        }}
                                                      >
                                                        {adjItem.old_quantity} →{" "}
                                                        {adjItem.new_quantity}
                                                      </span>
                                                    </div>
                                                    <div
                                                      className="d-flex justify-content-between"
                                                      style={{ fontSize: 11 }}
                                                    >
                                                      <span className="text-muted">
                                                        {formatMoney(
                                                          adjItem.unit_price,
                                                        )}
                                                        /sp
                                                      </span>
                                                      <span className="fw-semibold">
                                                        Chênh lệch:{" "}
                                                        {formatMoney(
                                                          adjItem.diff_total,
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {/* Action Buttons */}
                                      {adjustmentRequest?.status ===
                                        "PENDING_BUYER" && (
                                        <div
                                          className="d-flex flex-column gap-2"
                                          style={{ marginTop: 8 }}
                                        >
                                          <div className="d-flex gap-2 flex-wrap">
                                            <button
                                              type="button"
                                              disabled={
                                                adjustmentActionStatus[
                                                  shipment.id
                                                ] === "pending"
                                              }
                                              onClick={() =>
                                                handleAdjustmentDecision(
                                                  shipment.id,
                                                  adjustmentRequest.id,
                                                  "accepted",
                                                )
                                              }
                                              style={{
                                                background:
                                                  adjustmentActionStatus[
                                                    shipment.id
                                                  ] === "pending"
                                                    ? "#94d3a2"
                                                    : "#22c55e",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "8px 16px",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor:
                                                  adjustmentActionStatus[
                                                    shipment.id
                                                  ] === "pending"
                                                    ? "not-allowed"
                                                    : "pointer",
                                                transition: "all 0.25s ease",
                                                opacity:
                                                  adjustmentActionStatus[
                                                    shipment.id
                                                  ] === "pending"
                                                    ? 0.7
                                                    : 1,
                                              }}
                                            >
                                              ✓ Chấp nhận
                                            </button>
                                            <button
                                              type="button"
                                              disabled={
                                                adjustmentActionStatus[
                                                  shipment.id
                                                ] === "pending"
                                              }
                                              onClick={() =>
                                                handleAdjustmentDecision(
                                                  shipment.id,
                                                  adjustmentRequest.id,
                                                  "rejected",
                                                )
                                              }
                                              style={{
                                                background:
                                                  adjustmentActionStatus[
                                                    shipment.id
                                                  ] === "pending"
                                                    ? "#f5c2c7"
                                                    : "white",
                                                color: "#ef4444",
                                                border: "1px solid #fca5a5",
                                                borderRadius: 6,
                                                padding: "8px 16px",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor:
                                                  adjustmentActionStatus[
                                                    shipment.id
                                                  ] === "pending"
                                                    ? "not-allowed"
                                                    : "pointer",
                                                transition: "all 0.25s ease",
                                                opacity:
                                                  adjustmentActionStatus[
                                                    shipment.id
                                                  ] === "pending"
                                                    ? 0.7
                                                    : 1,
                                              }}
                                            >
                                              ✕ Từ chối
                                            </button>
                                          </div>
                                          {adjustmentActionMessage[
                                            shipment.id
                                          ] && (
                                            <p
                                              className="mb-0"
                                              style={{
                                                fontSize: 11,
                                                color: "#475569",
                                              }}
                                            >
                                              {
                                                adjustmentActionMessage[
                                                  shipment.id
                                                ]
                                              }
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="mb-3">
                                <p
                                  className="mb-2 fw-bold text-uppercase"
                                  style={{
                                    fontSize: 11,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  San pham trong kien hang
                                </p>

                                {shipment.items && shipment.items.length > 0 ? (
                                  <div className="d-flex flex-column gap-2">
                                    {shipment.items.map((item) => (
                                      <div
                                        key={`${shipment.id}-item-${item.id}`}
                                        className="d-flex gap-3 align-items-start rounded-3 border p-2"
                                        style={{
                                          borderColor: "#f1f5f9",
                                          background: "#fff",
                                        }}
                                      >
                                        <img
                                          src={item.productImage}
                                          alt={item.productName}
                                          style={{
                                            ...styles.productImg,
                                            width: 56,
                                            height: 56,
                                          }}
                                        />
                                        <div className="flex-grow-1">
                                          <p
                                            className="mb-1 fw-semibold"
                                            style={{
                                              fontSize: 12,
                                              lineHeight: 1.4,
                                              color: "#1e293b",
                                            }}
                                          >
                                            {item.productName}
                                          </p>
                                          <p
                                            className="mb-1 text-muted"
                                            style={{ fontSize: 11 }}
                                          >
                                            {item.variant
                                              ? `${item.variant} | `
                                              : ""}
                                            SKU: {item.sku}
                                          </p>
                                          <div className="d-flex align-items-center justify-content-between gap-2">
                                            <span
                                              style={{
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: "#137fec",
                                              }}
                                            >
                                              {formatMoney(item.price)}
                                            </span>
                                            <span style={styles.qtyBadge}>
                                              So luong:{" "}
                                              {String(item.quantity).padStart(
                                                2,
                                                "0",
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p
                                    className="mb-0 text-muted"
                                    style={{ fontSize: 11 }}
                                  >
                                    Chua co thong tin san pham cho kien hang
                                    nay.
                                  </p>
                                )}
                              </div>

                              {shipment.statusHistory &&
                                shipment.statusHistory.length > 0 && (
                                  <ul className="mb-0 ps-3">
                                    {shipment.statusHistory.map(
                                      (history, index) => (
                                        <li
                                          key={`${shipment.id}-history-${index}`}
                                          className="small mb-1"
                                        >
                                          <span className="fw-semibold">
                                            {shipmentStepLabel[history.status]}:
                                          </span>{" "}
                                          {history.description ||
                                            "Cap nhat trang thai"}{" "}
                                          -{" "}
                                          <span className="text-secondary">
                                            {formatDate(history.updatedAt)}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section style={styles.cardDefault}>
                <h3
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#475569",
                  }}
                  className="mb-3 d-flex align-items-center gap-2"
                >
                  <Clock3 size={16} /> Lich su don hang
                </h3>
                <div className="d-flex flex-column gap-2">
                  {order.logs?.map((log) => (
                    <div
                      key={log.id}
                      className="d-flex flex-wrap align-items-center justify-content-between rounded-3 border px-3 py-2"
                    >
                      <div>
                        <p
                          className="mb-0 fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          {log.note}
                        </p>
                        <p className="mb-0 text-secondary small">
                          {log.action}
                        </p>
                      </div>
                      <p className="mb-0 text-secondary small">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div style={{ position: "sticky", top: 72 }}>
              <section style={styles.summaryCard}>
                <div
                  style={styles.summaryHeader}
                  className="d-flex justify-content-between align-items-center"
                >
                  <h3
                    style={{ fontWeight: 700, fontSize: 15 }}
                    className="mb-0"
                  >
                    Tong ket don hang
                  </h3>
                  <span style={styles.itemsBadge}>
                    {order.itemsCount} san pham
                  </span>
                </div>

                <div className="p-4 d-flex flex-column gap-4">
                  <div>
                    <h5
                      className="fw-bold mb-3 d-flex align-items-center gap-2"
                      style={{ fontSize: 14 }}
                    >
                      <ReceiptText size={16} /> Thanh toan
                    </h5>

                    <div
                      className="d-flex justify-content-between mb-2"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Tam tinh</span>
                      <span className="fw-semibold">
                        {formatMoney(order.subtotalAmount)}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between mb-2"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Giam gia</span>
                      <span className="fw-semibold text-danger">
                        -{formatMoney(order.discountAmount)}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between mb-2"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Phi van chuyen</span>
                      <span className="fw-semibold">
                        {formatMoney(order.shippingAmount)}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between mb-3"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Thue</span>
                      <span className="fw-semibold">
                        {formatMoney(order.taxAmount)}
                      </span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: 14,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-end">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          Tong thanh toan
                        </span>
                        <div className="text-end">
                          <p
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              color: "#137fec",
                              lineHeight: 1,
                            }}
                            className="mb-0"
                          >
                            {formatMoney(order.totalAmount)}
                          </p>
                          <p
                            className="text-muted fst-italic mb-0"
                            style={{ fontSize: 10 }}
                          >
                            Da bao gom VAT
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5
                      className="fw-bold mb-2 d-flex align-items-center gap-2"
                      style={{ fontSize: 13 }}
                    >
                      <MapPin size={16} /> Thong tin nhan hang
                    </h5>
                    <p className="mb-1 fw-semibold" style={{ fontSize: 13 }}>
                      {order.customerName}
                    </p>
                    <p className="mb-1 text-secondary" style={{ fontSize: 12 }}>
                      {order.customerPhone}
                    </p>
                    <p className="mb-0 text-secondary" style={{ fontSize: 12 }}>
                      {order.shippingAddress}
                    </p>
                  </div>

                  <div>
                    <h5
                      className="fw-bold mb-2 d-flex align-items-center gap-2"
                      style={{ fontSize: 13 }}
                    >
                      <CreditCard size={16} /> Giao dich
                    </h5>
                    <p className="mb-1 text-secondary" style={{ fontSize: 12 }}>
                      Phuong thuc: <strong>{order.paymentMethod}</strong>
                    </p>
                    <p className="mb-0 text-secondary" style={{ fontSize: 12 }}>
                      Ma giao dich:{" "}
                      <strong>{order.transactionId || "Chua co"}</strong>
                    </p>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="button" style={styles.btnOrder}>
                      <span className="d-flex align-items-center gap-2">
                        <Lock size={16} strokeWidth={2} /> THEO DOI VAN DON
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          opacity: 0.85,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Xem cap nhat moi nhat
                      </span>
                    </button>

                    <button type="button" style={styles.btnSecondary}>
                      <span className="d-inline-flex align-items-center gap-2">
                        <Headset size={14} /> Lien he ho tro
                      </span>
                    </button>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center gap-4"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      <ShieldCheck
                        size={12}
                        color="#22c55e"
                        strokeWidth={2.5}
                      />
                      An toan
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={12} color="#22c55e" strokeWidth={2.5} />
                      Xac thuc
                    </div>
                  </div>
                </div>
              </section>

              <div style={styles.infoNote} className="mt-3 d-flex gap-3">
                <Info
                  size={18}
                  className="text-muted flex-shrink-0"
                  strokeWidth={1.8}
                />
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: 11, lineHeight: 1.7 }}
                >
                  Du lieu trang nay duoc lay tu API thuc te. Thong tin nhan
                  hang, san pham, kien hang va lich su trang thai cua tung kien
                  duoc cap nhat theo he thong don hang.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
