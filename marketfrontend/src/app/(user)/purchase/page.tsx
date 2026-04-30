"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ClipboardList,
  Coins,
  MessageSquare,
  PackageSearch,
  Pencil,
  Search,
  Store,
  Ticket,
  User,
  XCircle,
} from "lucide-react";

import { API_URL } from "@/helper/api";
import { useUserAuth } from "@/context/UserAuthContext";

type PurchaseItem = {
  id: number;
  productName: string;
  variantName: string;
  image: string;
  quantity: number;
  price: number;
  totalPrice: number;
  discountAmount: number;
};

type PurchaseShipment = {
  shipmentId: number;
  orderId: number;
  orderNumber: string;
  shopId: number;
  shopName: string;
  trackingNumber: string;
  carrierName: string;
  shippingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  createdAt: string;
  items: PurchaseItem[];
};

type PurchaseTabKey =
  | "all"
  | "payment"
  | "shipping"
  | "delivery"
  | "completed"
  | "canceled"
  | "return";

type PurchaseProfile = {
  name: string;
  avatar: string;
};

const PURCHASE_TABS: Array<{ key: PurchaseTabKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "payment", label: "To Pay" },
  { key: "shipping", label: "Shipping" },
  { key: "delivery", label: "To Receive" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Cancelled" },
  { key: "return", label: "Return/Refund" },
];

const SHOP_FALLBACK_PREFIX = "Shop #";
const BRAND_BLUE = "#2478df";
const BRAND_BLUE_DARK = "#1764c0";
const ACCENT_ORANGE = "#2478df";

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickText = (...values: unknown[]) => {
  const found = values.find((value) => String(value ?? "").trim() !== "");
  return found == null ? "" : String(found);
};

const formatMoney = (value: number) =>
  `${Math.max(0, Math.round(value)).toLocaleString("en-US")} VND`;

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", { hour12: false });
};

const normalizeStatus = (value: string) => value.trim().toUpperCase();

const getShipmentTab = (shipment: PurchaseShipment): PurchaseTabKey => {
  const shippingStatus = normalizeStatus(shipment.shippingStatus);
  const paymentStatus = normalizeStatus(shipment.paymentStatus);
  const orderStatus = normalizeStatus(shipment.orderStatus);

  if (
    shippingStatus.includes("RETURN") ||
    shippingStatus.includes("REFUND") ||
    orderStatus.includes("RETURN") ||
    orderStatus.includes("REFUND")
  ) {
    return "return";
  }

  if (
    shippingStatus === "CANCELED" ||
    shippingStatus === "CANCELLED" ||
    orderStatus === "CANCELED" ||
    orderStatus === "CANCELLED"
  ) {
    return "canceled";
  }

  if (shippingStatus === "COMPLETED" || orderStatus === "COMPLETED") {
    return "completed";
  }

  if (shippingStatus === "DELIVERING" || shippingStatus === "DELIVERED") {
    return "delivery";
  }

  if (
    shippingStatus === "CONFIRMED" ||
    shippingStatus === "PICKED_UP" ||
    shippingStatus === "SHIPPING" ||
    shippingStatus === "IN_TRANSIT"
  ) {
    return "shipping";
  }

  if (
    paymentStatus === "PENDING" ||
    paymentStatus === "UNPAID" ||
    shippingStatus === "PENDING"
  ) {
    return "payment";
  }

  return "all";
};

const getStatusLabel = (shipment: PurchaseShipment) => {
  const tab = getShipmentTab(shipment);
  const map: Record<PurchaseTabKey, string> = {
    all: shipment.shippingStatus,
    payment: "TO PAY",
    shipping: "SHIPPING",
    delivery: "TO RECEIVE",
    completed: "COMPLETED",
    canceled: "CANCELLED",
    return: "RETURN/REFUND",
  };
  return map[tab];
};

const getStatusStyle = (tab: PurchaseTabKey) => {
  if (tab === "canceled") {
    return { background: "#fff1f2", color: "#2478df" };
  }

  if (tab === "completed") {
    return { background: "#ecfdf3", color: "#16803c" };
  }

  if (tab === "return") {
    return { background: "#fff7ed", color: "#2478df" };
  }

  return { background: "#eaf3ff", color: BRAND_BLUE };
};

const isPendingShipment = (shipment: PurchaseShipment) =>
  normalizeStatus(shipment.shippingStatus) === "PENDING";

const getShipmentSearchText = (shipment: PurchaseShipment) =>
  [
    shipment.shopName,
    shipment.orderNumber,
    shipment.trackingNumber,
    shipment.shipmentId,
    ...shipment.items.flatMap((item) => [
      item.productName,
      item.variantName,
      item.id,
    ]),
  ]
    .join(" ")
    .toLowerCase();

const getShopFallback = (shopId: number) =>
  shopId > 0 ? `${SHOP_FALLBACK_PREFIX}${shopId}` : "Shop";

const isFallbackShopName = (shopName: string) =>
  !shopName || shopName.startsWith(SHOP_FALLBACK_PREFIX);

const normalizeItem = (
  item: any,
  itemDiscountByOrderItemId = new Map<number, number>(),
): PurchaseItem => {
  const id = asNumber(item?.id ?? item?.itemId, 0);

  return {
    id,
    productName: pickText(item?.productName, item?.product_name, "Product"),
    variantName: pickText(item?.variantName, item?.variant_name),
    image: pickText(
      item?.image,
      item?.imageUrl,
      item?.image_url,
      "/image/user/avatar_default.jpg",
    ),
    quantity: asNumber(item?.quantity, 0),
    price: asNumber(item?.price, 0),
    totalPrice: asNumber(item?.totalPrice ?? item?.total_price, 0),
    discountAmount: asNumber(
      item?.discountAmount ?? item?.discount_amount,
      itemDiscountByOrderItemId.get(id) || 0,
    ),
  };
};

const normalizeShipment = (
  shipment: any,
  orderSeed: any = {},
  itemDiscountByOrderItemId = new Map<number, number>(),
): PurchaseShipment => {
  const order = shipment?.order || {};
  const shipmentId = asNumber(
    shipment?.shipmentId ?? shipment?.id ?? shipment?.shipment_id,
    0,
  );
  const orderId = asNumber(
    shipment?.orderId ??
      shipment?.order_id ??
      orderSeed?.orderId ??
      orderSeed?.id,
    0,
  );
  const shopId = asNumber(shipment?.shopId ?? shipment?.shop_id, 0);
  const items: PurchaseItem[] = Array.isArray(shipment?.items)
    ? shipment.items.map((item: any) =>
        normalizeItem(item, itemDiscountByOrderItemId),
      )
    : [];
  const itemDiscountAmount = items.reduce(
    (total, item) => total + item.discountAmount,
    0,
  );

  return {
    shipmentId,
    orderId,
    orderNumber: pickText(
      order?.orderNumber,
      order?.order_number,
      orderSeed?.orderNumber,
      orderSeed?.order_number,
      `ORD-${orderId}`,
    ),
    shopId,
    shopName: pickText(
      shipment?.shopName,
      shipment?.shop_name,
      orderSeed?.shopName,
      orderSeed?.shop_name,
      getShopFallback(shopId),
    ),
    trackingNumber: pickText(
      shipment?.trackingNumber,
      shipment?.tracking_number,
      "No tracking number yet",
    ),
    carrierName: pickText(shipment?.carrierName, shipment?.carrier_name, "LOG"),
    shippingStatus: pickText(
      shipment?.shippingStatus,
      shipment?.shipping_status,
      "PENDING",
    ),
    paymentStatus: pickText(
      order?.paymentStatus,
      order?.payment_status,
      orderSeed?.paymentStatus,
      orderSeed?.payment_status,
      "PENDING",
    ),
    paymentMethod: pickText(
      order?.paymentMethod,
      order?.payment_method,
      orderSeed?.paymentMethod,
      orderSeed?.payment_method,
      "COD",
    ),
    orderStatus: pickText(
      order?.orderStatus,
      order?.order_status,
      orderSeed?.orderStatus,
      orderSeed?.order_status,
      "PENDING",
    ),
    totalAmount: asNumber(
      shipment?.totalAmount ?? shipment?.total_amount ?? orderSeed?.finalAmount,
      0,
    ),
    shippingFee: asNumber(shipment?.shippingFee ?? shipment?.shipping_fee, 0),
    discountAmount: asNumber(
      shipment?.discountAmount ?? shipment?.discount_amount,
      itemDiscountAmount,
    ),
    createdAt: pickText(
      shipment?.createdAt,
      shipment?.created_at,
      orderSeed?.createdAt,
      orderSeed?.created_at,
    ),
    items,
  };
};

const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${path}`);
  }

  return response.json();
};

const getOrderId = (order: any) => asNumber(order?.orderId ?? order?.id, 0);

const getPayloadCandidates = (payload: any) =>
  [
    payload,
    payload?.data,
    payload?.shop,
    payload?.result,
    payload?.payload,
    payload?.data?.shop,
    payload?.data?.result,
  ].filter(Boolean);

const getShopDisplayName = (payload: any, fallback: string) => {
  for (const candidate of getPayloadCandidates(payload)) {
    const name = pickText(
      candidate?.shopName,
      candidate?.shop_name,
      candidate?.brandTitle,
      candidate?.brand_title,
      candidate?.name,
    );

    if (name) return name;
  }

  return fallback;
};

const buildItemDiscountMap = (redemptionItems: any[]) =>
  redemptionItems.reduce((map: Map<number, number>, item: any) => {
    const orderItemId = asNumber(item?.orderItemId ?? item?.order_item_id, 0);
    const discountAmount = asNumber(
      item?.discountAmount ?? item?.discount_amount,
      0,
    );

    if (orderItemId > 0 && discountAmount > 0) {
      map.set(orderItemId, (map.get(orderItemId) || 0) + discountAmount);
    }

    return map;
  }, new Map<number, number>());

const getOrderDetailItems = (orderDetail: any) => {
  const candidates = [
    orderDetail?.items,
    orderDetail?.orders_items,
    orderDetail?.orderItems,
    orderDetail?.order_items,
  ];

  return candidates.find(Array.isArray) || [];
};

const getOrderDetailShipments = (orderDetail: any) => {
  const candidates = [
    orderDetail?.shipments,
    orderDetail?.order_shipment,
    orderDetail?.orderShipments,
    orderDetail?.order_shipments,
  ];

  return candidates.find(Array.isArray) || [];
};

const getShipmentItems = (shipment: any, orderItems: any[]) => {
  if (Array.isArray(shipment?.items) && shipment.items.length > 0) {
    return shipment.items;
  }

  const shipmentId = asNumber(
    shipment?.shipmentId ?? shipment?.id ?? shipment?.shipment_id,
    0,
  );
  const shopId = asNumber(shipment?.shopId ?? shipment?.shop_id, 0);

  const itemsByShipment = orderItems.filter(
    (item) => asNumber(item?.shipmentId ?? item?.shipment_id, 0) === shipmentId,
  );

  if (itemsByShipment.length > 0) return itemsByShipment;

  return orderItems.filter(
    (item) =>
      shopId > 0 && asNumber(item?.shopId ?? item?.shop_id, 0) === shopId,
  );
};

const loadUserOrders = async (userId: number) => {
  const pageSize = 100;
  const firstPage = await fetchJson<any>(
    `/api/orders?userId=${userId}&page=1&size=${pageSize}&sortBy=date&sortOrder=desc`,
  );
  const orders = Array.isArray(firstPage?.orders) ? [...firstPage.orders] : [];
  const totalPages = asNumber(firstPage?.totalPages, 1);

  if (totalPages > 1) {
    const restPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        fetchJson<any>(
          `/api/orders?userId=${userId}&page=${index + 2}&size=${pageSize}&sortBy=date&sortOrder=desc`,
        ),
      ),
    );

    restPages.forEach((page) => {
      if (Array.isArray(page?.orders)) {
        orders.push(...page.orders);
      }
    });
  }

  return orders;
};

const loadShipmentDiscountsByUsage = async (
  userId: number,
  orderIds: number[],
) => {
  const orderIdSet = new Set(orderIds);
  const discounts = new Map<number, number>();

  try {
    const usageRows = await fetchJson<any[]>(
      `/api/voucher-usage-legacy/user/${userId}`,
    );

    usageRows.forEach((row) => {
      const orderId = asNumber(row?.orderId ?? row?.order_id, 0);
      const shipmentId = asNumber(
        row?.orderShipmentId ?? row?.order_shipment_id,
        0,
      );
      const discountAmount = asNumber(
        row?.discountAmount ?? row?.discount_amount,
        0,
      );

      if (orderIdSet.has(orderId) && shipmentId > 0 && discountAmount > 0) {
        discounts.set(
          shipmentId,
          (discounts.get(shipmentId) || 0) + discountAmount,
        );
      }
    });
  } catch (error) {
    console.warn("Failed to load shipment voucher usage:", error);
  }

  return discounts;
};

const loadShipmentsForOrder = async (order: any) => {
  const orderId = getOrderId(order);
  if (orderId <= 0) return [];

  const [orderDetail, redemptionItems] = await Promise.all([
    fetchJson<any>(`/api/orders/${orderId}`),
    fetchJson<any[]>(`/api/voucher-redemptions/order/${orderId}/items`).catch(
      () => [],
    ),
  ]);
  const itemDiscountByOrderItemId = buildItemDiscountMap(redemptionItems);
  const orderItems = getOrderDetailItems(orderDetail);
  const seedShipments = getOrderDetailShipments(orderDetail);
  const withFallbackItems = (shipment: any, detail: any = {}) => {
    const merged = { ...shipment, ...(detail?.data ?? detail) };

    return {
      ...merged,
      items: getShipmentItems(merged, orderItems),
    };
  };

  const shipmentDetails = await Promise.all(
    seedShipments.map(async (shipment: any) => {
      const shipmentId = asNumber(
        shipment?.id ?? shipment?.shipmentId ?? shipment?.shipment_id,
        0,
      );

      if (shipmentId <= 0) {
        return normalizeShipment(
          withFallbackItems(shipment),
          orderDetail || order,
          itemDiscountByOrderItemId,
        );
      }

      try {
        const detail = await fetchJson<any>(
          `/api/orders/shipments/${shipmentId}`,
        );
        return normalizeShipment(
          withFallbackItems(shipment, detail),
          orderDetail || order,
          itemDiscountByOrderItemId,
        );
      } catch {
        return normalizeShipment(
          withFallbackItems(shipment),
          orderDetail || order,
          itemDiscountByOrderItemId,
        );
      }
    }),
  );

  return shipmentDetails;
};

const loadShopNamesById = async (shipments: PurchaseShipment[]) => {
  const shopIds = Array.from(
    new Set(
      shipments
        .filter((shipment) => isFallbackShopName(shipment.shopName))
        .map((shipment) => shipment.shopId)
        .filter((id) => id > 0),
    ),
  );

  const entries = await Promise.all(
    shopIds.map(async (shopId) => {
      try {
        const shop = await fetchJson<any>(`/shops/${shopId}`);
        const name = getShopDisplayName(shop, "");
        return name ? ([shopId, name] as const) : null;
      } catch {
        return null;
      }
    }),
  );

  return new Map(
    entries.filter((entry): entry is readonly [number, string] => !!entry),
  );
};

const enrichShipmentData = async (
  shipments: PurchaseShipment[],
  usageDiscountByShipmentId: Map<number, number>,
) => {
  if (shipments.length === 0) return shipments;

  const shopNames = await loadShopNamesById(shipments);

  return shipments.map((shipment) => {
    const usageDiscount = usageDiscountByShipmentId.get(shipment.shipmentId);

    return {
      ...shipment,
      shopName: shopNames.get(shipment.shopId) || shipment.shopName,
      discountAmount:
        usageDiscount && usageDiscount > 0
          ? usageDiscount
          : shipment.discountAmount,
    };
  });
};

export default function PurchasePage() {
  const { userId } = useUserAuth();
  const [shipments, setShipments] = useState<PurchaseShipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<PurchaseTabKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState<PurchaseProfile>({
    name: "Account",
    avatar: "/image/user/avatar_default.jpg",
  });
  const [cancelingShipmentId, setCancelingShipmentId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const user = JSON.parse(raw);
      setProfile({
        name: pickText(
          user?.fullName,
          user?.full_name,
          user?.username,
          user?.email,
          "Account",
        ),
        avatar: pickText(
          user?.avatarUrl,
          user?.avatar_url,
          user?.avatar,
          "/image/user/avatar_default.jpg",
        ),
      });
    } catch {
      // Ignore malformed local profile data.
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const loadPurchases = async () => {
      setLoading(true);
      setError("");

      try {
        const orders = await loadUserOrders(userId);
        const orderIds = orders.map(getOrderId).filter((id) => id > 0);
        const [shipmentGroups, usageDiscountByShipmentId] = await Promise.all([
          Promise.all(orders.map(loadShipmentsForOrder)),
          loadShipmentDiscountsByUsage(userId, orderIds),
        ]);
        const nextShipments = shipmentGroups
          .flat()
          .filter((shipment) => shipment.shipmentId > 0)
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );
        const enrichedShipments = await enrichShipmentData(
          nextShipments,
          usageDiscountByShipmentId,
        );

        if (mounted) {
          setShipments(enrichedShipments);
        }
      } catch (err) {
        console.error("Load purchases error:", err);
        if (mounted) {
          setShipments([]);
          setError("Unable to load purchase list.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPurchases();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const filteredShipments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const tabMatches =
        activeTab === "all" || getShipmentTab(shipment) === activeTab;
      const searchMatches =
        !normalizedSearch ||
        getShipmentSearchText(shipment).includes(normalizedSearch);

      return tabMatches && searchMatches;
    });
  }, [activeTab, searchTerm, shipments]);

  const handleCancelShipment = async (shipment: PurchaseShipment) => {
    if (!isPendingShipment(shipment)) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel the order? #${shipment.shipmentId}?`,
    );
    if (!confirmed) return;

    setCancelingShipmentId(shipment.shipmentId);

    try {
      const response = await fetch(
        `${API_URL}/api/orders/shipments/${shipment.shipmentId}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            reason: "Buyer canceled pending shipment",
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to cancel this shipment");
      }

      const data = await response.json();
      setShipments((current) => {
        const next = current.map((item) =>
          item.shipmentId === shipment.shipmentId
            ? {
                ...item,
                shippingStatus: pickText(
                  data?.shippingStatus,
                  data?.shipping_status,
                  "CANCELED",
                ),
              }
            : item,
        );
        const allOrderShipmentsCanceled = next
          .filter((item) => item.orderId === shipment.orderId)
          .every((item) => normalizeStatus(item.shippingStatus) === "CANCELED");

        return next.map((item) =>
          item.orderId === shipment.orderId && allOrderShipmentsCanceled
            ? { ...item, orderStatus: "CANCELED" }
            : item,
        );
      });
    } catch (err) {
      console.error("Cancel shipment error:", err);
      window.alert(
        err instanceof Error ? err.message : "Unable to cancel this shipment",
      );
    } finally {
      setCancelingShipmentId(null);
    }
  };

  if (!userId) {
    return (
      <div className="container py-5">
        <div className="border bg-white p-4 text-center">
          <PackageSearch size={36} className="text-secondary mb-3" />
          <h1 className="h5 fw-bold">Please sign in</h1>
          <p className="text-muted mb-3">
            Sign in to view your purchase history.
          </p>
          <Link
            href="/login"
            className="btn text-white"
            style={{ background: BRAND_BLUE, borderColor: BRAND_BLUE }}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-page">
      <style>{`
        .purchase-page {
          min-height: 100vh;
          background: #f4f6f8;
          color: #1f2937;
        }
        .purchase-shell {
          max-width: 1220px;
        }
        .purchase-sidebar {
          position: sticky;
          top: 92px;
        }
        .purchase-profile {
          padding: 12px 0 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .purchase-avatar {
          width: 58px;
          height: 58px;
          border: 3px solid #fff;
          box-shadow: 0 6px 18px rgba(31, 41, 55, 0.12);
        }
        .purchase-nav-link {
          border-radius: 8px;
          color: #334155;
          padding: 9px 10px;
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .purchase-nav-link:hover {
          background: #eef5ff;
          color: ${BRAND_BLUE};
          transform: translateX(2px);
        }
        .purchase-nav-link.active {
          background: #eaf3ff;
          color: ${BRAND_BLUE};
          font-weight: 700;
        }
        .purchase-tabs {
          border: 1px solid #edf0f3;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }
        .purchase-tab-list {
          display: flex;
          width: 100%;
        }
        .purchase-tab {
          align-items: center;
          background: #fff;
          border: 0;
          border-bottom: 2px solid transparent;
          color: #111827;
          display: inline-flex;
          flex: 1 1 0;
          justify-content: center;
          height: 58px;
          min-width: 0;
          padding: 0 22px;
          white-space: nowrap;
          transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .purchase-tab:hover {
          background: #f8fbff;
          color: ${BRAND_BLUE};
        }
        .purchase-tab.active {
          color: ${BRAND_BLUE};
          border-bottom-color: ${BRAND_BLUE};
          font-weight: 700;
        }
        .purchase-search {
          height: 52px;
          border: 1px solid #edf0f3;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
        }
        .purchase-card {
          border: 1px solid #e8edf3;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .purchase-card:hover {
          border-color: #d8e7fb;
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
          transform: translateY(-1px);
        }
        .shop-action {
          height: 30px;
          border-radius: 4px;
          font-size: 13px;
        }
        .status-pill {
          border-radius: 4px;
          padding: 6px 11px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .product-thumb {
          width: 92px;
          height: 92px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          object-fit: cover;
        }
        .purchase-summary {
          background: #fbfcfe;
        }
        .purchase-total {
          color: ${ACCENT_ORANGE};
          font-size: 25px;
          line-height: 1;
        }
        .purchase-btn {
          min-width: 166px;
          height: 42px;
          border-radius: 4px;
          font-weight: 600;
        }
        .purchase-btn-primary {
          background: ${BRAND_BLUE};
          border-color: ${BRAND_BLUE};
          color: #fff;
        }
        .purchase-btn-primary:hover {
          background: ${BRAND_BLUE_DARK};
          border-color: ${BRAND_BLUE_DARK};
          color: #fff;
        }
        .purchase-btn-accent {
          background: ${ACCENT_ORANGE};
          border-color: ${ACCENT_ORANGE};
          color: #fff;
        }
        .purchase-muted-panel {
          border: 1px solid #edf0f3;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
        }
        @media (max-width: 991.98px) {
          .purchase-sidebar {
            position: static;
          }
          .purchase-tab-list {
            flex-wrap: wrap;
          }
          .purchase-tab {
            flex: 1 1 150px;
            font-size: 14px;
          }
        }
        @media (max-width: 575.98px) {
          .purchase-card .product-price {
            min-width: 100%;
            text-align: left !important;
          }
          .purchase-btn {
            width: 100%;
          }
        }
      `}</style>
      <div className="container py-4 purchase-shell">
        <div className="row g-4">
          <aside className="col-12 col-lg-2">
            <div className="pe-lg-2 purchase-sidebar">
              <div className="d-flex align-items-center gap-3 purchase-profile">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="rounded-circle object-fit-cover purchase-avatar"
                />
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold text-truncate">{profile.name}</div>
                  <Link
                    href="/profile"
                    className="text-muted text-decoration-none small d-inline-flex align-items-center gap-1"
                  >
                    <Pencil size={14} />
                    Edit Profile
                  </Link>
                </div>
              </div>

              <nav className="d-flex flex-column gap-1 small pt-3">
                <div className="purchase-nav-link d-flex align-items-center gap-2">
                  <Bell size={18} style={{ color: BRAND_BLUE }} />
                  Notifications
                </div>
                <Link
                  href="/profile"
                  className="purchase-nav-link d-flex align-items-center gap-2 text-decoration-none"
                >
                  <User size={18} style={{ color: BRAND_BLUE }} />
                  My Account
                </Link>
                <Link
                  href="/purchase"
                  className="purchase-nav-link active d-flex align-items-center gap-2 text-decoration-none"
                >
                  <ClipboardList size={18} />
                  My Purchases
                </Link>
                <Link
                  href="/voucher"
                  className="purchase-nav-link d-flex align-items-center gap-2 text-decoration-none"
                >
                  <Ticket size={18} style={{ color: ACCENT_ORANGE }} />
                  Voucher Wallet
                </Link>
              </nav>
            </div>
          </aside>

          <section className="col-12 col-lg-10">
            <div className="bg-white mb-3 purchase-tabs">
              <div className="purchase-tab-list">
                {PURCHASE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`purchase-tab ${
                      activeTab === tab.key ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="purchase-search d-flex align-items-center gap-3 mb-3 px-3"
            >
              <Search size={24} style={{ color: "#b8b8b8" }} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="form-control border-0 bg-transparent shadow-none p-0"
                placeholder="Search by shop name, order ID, tracking number, or product name"
              />
            </div>

            {loading && (
              <div className="purchase-muted-panel p-4 text-center text-muted">
                Loading purchases...
              </div>
            )}

            {!loading && error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && shipments.length === 0 && (
              <div className="purchase-muted-panel p-5 text-center">
                <PackageSearch size={36} className="text-secondary mb-3" />
                <h2 className="h6 fw-bold">No purchases yet</h2>
                <p className="text-muted mb-0">
                  Your orders will appear here after checkout.
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              shipments.length > 0 &&
              filteredShipments.length === 0 && (
                <div className="purchase-muted-panel p-5 text-center text-muted">
                  No matching purchases found.
                </div>
              )}

            <div className="d-flex flex-column" style={{ gap: 12 }}>
              {filteredShipments.map((shipment) => {
                const tab = getShipmentTab(shipment);
                const isCanceled = tab === "canceled";
                const statusStyle = getStatusStyle(tab);

                return (
                  <section
                    key={shipment.shipmentId}
                    className="purchase-card"
                    title={[
                      shipment.orderNumber,
                      `Shipment #${shipment.shipmentId}`,
                      shipment.carrierName,
                      shipment.trackingNumber,
                      shipment.createdAt ? formatDate(shipment.createdAt) : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  >
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3 px-4 py-3 border-bottom">
                      <div style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <Store size={18} className="text-secondary" />
                          <span className="fw-bold text-truncate">
                            {shipment.shopName}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm text-white d-inline-flex align-items-center gap-1 shop-action"
                            style={{
                              background: BRAND_BLUE,
                              borderColor: BRAND_BLUE,
                            }}
                          >
                            <MessageSquare size={14} />
                            Chat
                          </button>
                          {shipment.shopId > 0 ? (
                            <Link
                              href={`/shop/${shipment.shopId}`}
                              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 shop-action"
                            >
                              <Store size={14} />
                              View Shop
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 shop-action"
                              disabled
                            >
                              <Store size={14} />
                              View Shop
                            </button>
                          )}
                        </div>
                        <div className="small text-muted mt-2 text-truncate">
                          {shipment.orderNumber} · Shipment #{shipment.shipmentId} ·{" "}
                          {shipment.carrierName} · {shipment.trackingNumber}
                        </div>
                      </div>
                      <div
                        className="status-pill text-uppercase align-self-start align-self-md-center"
                        style={statusStyle}
                      >
                        {getStatusLabel(shipment)}
                      </div>
                    </div>

                    <div className="px-4 py-3 border-bottom bg-white">
                      {shipment.items.length > 0 ? (
                        shipment.items.map((item, index) => {
                          const originalPrice =
                            item.totalPrice || item.price * item.quantity;
                          const finalPrice = Math.max(
                            0,
                            originalPrice - item.discountAmount,
                          );

                          return (
                            <div
                              key={`${shipment.shipmentId}-${item.id}-${index}`}
                              className="d-flex flex-wrap flex-sm-nowrap gap-3 align-items-start py-2"
                            >
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="product-thumb flex-shrink-0"
                              />
                              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <div className="fs-6 text-truncate">
                                  {item.productName}
                                </div>
                                {item.variantName && (
                                  <div className="text-muted small mt-1">
                                    Variation: {item.variantName}
                                  </div>
                                )}
                                <div className="small mt-1">
                                  x{item.quantity}
                                </div>
                              </div>
                              <div
                                className="product-price text-end flex-shrink-0"
                                style={{ minWidth: 128 }}
                              >
                                {item.discountAmount > 0 ? (
                                  <div className="d-flex justify-content-end gap-2 flex-wrap">
                                    <span className="text-muted text-decoration-line-through">
                                      {formatMoney(originalPrice)}
                                    </span>
                                    <span style={{ color: ACCENT_ORANGE }}>
                                      {formatMoney(finalPrice)}
                                    </span>
                                  </div>
                                ) : (
                                  <span>{formatMoney(originalPrice)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-muted small py-3">
                          No product information is available for this shipment.
                        </div>
                      )}
                    </div>

                    <div className="purchase-summary px-4 py-4">
                      <div className="d-flex flex-column align-items-end gap-2 mb-4">
                        {shipment.discountAmount > 0 && (
                          <div className="d-flex justify-content-end align-items-center gap-3">
                            <span className="text-muted">Discount:</span>
                            <span className="text-success">
                              -{formatMoney(shipment.discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className="d-flex justify-content-end align-items-center gap-3">
                          <span>Total:</span>
                          <span
                            className="purchase-total fw-semibold"
                          >
                            {formatMoney(shipment.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="small text-muted">
                          {isCanceled
                            ? "Cancelled by you"
                            : `Shipping fee: ${formatMoney(shipment.shippingFee)}`}
                        </div>

                        <div className="d-flex flex-wrap justify-content-end gap-2">
                          {isPendingShipment(shipment) && (
                            <button
                              type="button"
                              className="btn purchase-btn purchase-btn-primary d-inline-flex align-items-center justify-content-center gap-1"
                              disabled={
                                cancelingShipmentId === shipment.shipmentId
                              }
                              onClick={() => handleCancelShipment(shipment)}
                            >
                              <XCircle size={16} />
                              {cancelingShipmentId === shipment.shipmentId
                                ? "Cancelling"
                                : "Cancel Order"}
                            </button>
                          )}
                          {isCanceled && (
                            <button
                              type="button"
                              className="btn purchase-btn purchase-btn-accent"
                            >
                              Buy Again
                            </button>
                          )}
                          <Link
                            href={`/orders/${shipment.orderId}`}
                            className="btn btn-outline-secondary purchase-btn d-inline-flex align-items-center justify-content-center"
                          >
                            {isCanceled
                              ? "View Cancellation Details"
                              : "View Details"}
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline-secondary purchase-btn"
                          >
                            Contact Seller
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
