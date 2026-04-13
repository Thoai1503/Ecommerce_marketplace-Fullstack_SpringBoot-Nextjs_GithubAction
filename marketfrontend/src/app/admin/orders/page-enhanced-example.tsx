/**
 * Example: Orders List Page with Enriched Data Support
 * File: src/app/admin/orders/page-enhanced-example.tsx
 *
 * This is an example showing how to use the new enriched data feature
 * in useOrders hook. Choose whether to use basic (fast) or enriched (complete) data.
 *
 * To use this:
 * 1. Copy relevant sections to your actual page.tsx
 * 2. Uncomment enrichData: true to enable enriched mode
 * 3. Test with real data
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/admin/useOrders";
import { useToast } from "@/context/ToastContext";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Order, OrderStatus } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function OrdersPageEnhancedExample() {
  const router = useRouter();
  const toast = useToast();

  // OPTION 1: Basic mode (current, fast)
  // const { orders, isLoading, isError, refetch } = useOrders();

  // OPTION 2: Enriched mode (slower but includes user info, address, items)
  // Uncomment this to enable full data enrichment
  const { orders, isLoading, isError, refetch } = useOrders({
    enrichData: false, // Change to true for full data
  });

  const [activeTab, setActiveTab] = useState<"ALL" | OrderStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-600">
        <h2>Error loading orders</h2>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchTab = activeTab === "ALL" || order.status === activeTab;
      const matchSearch =
        order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerName &&
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <Breadcrumbs items={[{ label: "Orders" }]} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by order code or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            {tab}
            <span className="ml-2 text-sm text-gray-500">
              ({orders.filter((o) => o.status === tab || tab === "ALL").length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Order Code
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">
                    <button
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="hover:underline"
                    >
                      {order.orderCode}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-gray-500">
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ₫{order.totalAmount.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} color="blue" />
        <StatCard
          label="Pending"
          value={orders.filter((o) => o.status === "PENDING").length}
          color="yellow"
        />
        <StatCard
          label="Completed"
          value={orders.filter((o) => o.status === "COMPLETED").length}
          color="green"
        />
        <StatCard
          label="Total Revenue"
          value={
            "₫" +
            orders
              .reduce((sum, o) => sum + o.totalAmount, 0)
              .toLocaleString("vi-VN")
          }
          color="purple"
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div
      className={`${colorClasses[color as keyof typeof colorClasses]} p-4 rounded-lg`}
    >
      <div className="text-sm font-medium opacity-75">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
