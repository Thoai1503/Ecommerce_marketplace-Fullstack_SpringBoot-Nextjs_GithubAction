/**
 * Example: Order Detail Page with Enriched Data
 * File: src/app/admin/orders/[id]/page-enhanced-example.tsx
 *
 * This example shows how to use enriched order data to display
 * complete customer information, address, and items.
 *
 * Benefits:
 * - Shows real customer names, emails, phones
 * - Displays full shipping address
 * - Lists all order items with details
 *
 * Note: This fetches additional data after initial load
 * Use for detail views where performance is less critical
 */

"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapOrderEnhanced } from "@/service/orders";
import { http2 } from "@/lib/http";
import { Order } from "@/types";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface OrderDetailPageProps {
  params: { id: string };
}

export default function OrderDetailPageEnhancedExample({
  params,
}: OrderDetailPageProps) {
  const [enrichedOrder, setEnrichedOrder] = useState<Order | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);

  // Fetch basic order data
  const { data: apiOrder, isLoading } = useQuery({
    queryKey: ["order", params.id],
    queryFn: async () => {
      const response = await http2(`/admin/orders`);
      return response.orders?.find(
        (o: any) => o.orderId?.toString() === params.id,
      );
    },
  });

  // Enhance with related data when apiOrder is loaded
  useEffect(() => {
    if (apiOrder) {
      setIsEnriching(true);
      mapOrderEnhanced(apiOrder, true)
        .then((enriched) => {
          setEnrichedOrder(enriched);
          setIsEnriching(false);
        })
        .catch(() => {
          setIsEnriching(false);
        });
    }
  }, [apiOrder]);

  const order = enrichedOrder || apiOrder;

  if (isLoading || !order) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Orders", path: "/admin/orders" },
          { label: order.orderCode },
        ]}
      />

      {isEnriching && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-blue-800">Loading additional order details...</p>
        </div>
      )}

      {/* Order Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{order.orderCode}</h1>
            <p className="text-gray-600 mt-1">
              Order created on{" "}
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              ₫{order.totalAmount.toLocaleString("vi-VN")}
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} variant="payment" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Card */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium">
                {order.customerName || "N/A"}
                {!enrichedOrder && order.customerName === "Customer" && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Loading...)
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">
                {order.customerEmail || "N/A"}
                {!enrichedOrder && !order.customerEmail && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Loading...)
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-medium">
                {order.customerPhone || "N/A"}
                {!enrichedOrder && !order.customerPhone && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Loading...)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
          <div className="space-y-2">
            <p className="font-medium">
              {order.shippingAddress || "N/A"}
              {!enrichedOrder && !order.shippingAddress && (
                <span className="text-xs text-gray-500 ml-2">(Loading...)</span>
              )}
            </p>
          </div>

          {order.deliveryNumber && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm text-gray-600">Tracking Number</label>
              <p className="font-medium  text-blue-600">
                {order.deliveryNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      {enrichedOrder && order.items && order.items.length > 0 ? (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">
            Items ({order.items.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Product</th>
                  <th className="text-center py-2 px-4 font-medium">
                    Quantity
                  </th>
                  <th className="text-right py-2 px-4 font-medium">Price</th>
                  <th className="text-right py-2 px-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {item.productName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.sku || "N/A"}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {item.quantity || 1}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₫{(item.price || 0).toLocaleString("vi-VN")}
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      ₫
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : isEnriching ? (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Items</h2>
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Items</h2>
          <p className="text-gray-600">Item count: {order.itemsCount || 0}</p>
        </div>
      )}

      {/* Financial Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Financial Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₫{order.subtotalAmount.toLocaleString("vi-VN")}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₫{order.discountAmount.toLocaleString("vi-VN")}</span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₫{order.taxAmount.toLocaleString("vi-VN")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₫{order.shippingAmount.toLocaleString("vi-VN")}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>Total</span>
            <span className="text-blue-600">
              ₫{order.totalAmount.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Payment Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Method</span>
            <span className="font-medium">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <StatusBadge status={order.paymentStatus} variant="payment" />
          </div>
          {order.transactionId && (
            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="font-medium text-gray-600 text-sm">
                {order.transactionId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Internal Notes */}
      {order.internalNote && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="font-bold text-yellow-900 mb-2">Internal Notes</h3>
          <p className="text-yellow-800">{order.internalNote}</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  variant = "default",
}: {
  status: string;
  variant?: "default" | "payment";
}) {
  const defaultColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-orange-100 text-orange-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };

  const paymentColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    UNPAID: "bg-gray-100 text-gray-800",
    REFUNDED: "bg-blue-100 text-blue-800",
  };

  const colors = variant === "payment" ? paymentColors : defaultColors;
  const colorClass = colors[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}
