"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "../../../service/orders";
import { Order, ItemStatus } from "../../../types/index";
import {
  ChevronLeft,
  Package,
  User,
  MapPin,
  Printer,
  Sparkles,
  FileText,
  CreditCard,
  ShieldCheck,
  Check,
  BrainCircuit,
  Lightbulb,
  Fingerprint,
  Phone,
  Gift,
  ArrowRight,
} from "lucide-react";
import ShipmentCard from "../../../components/admin/orders/ShipmentCard";
import ToastComponent, { ToastType } from "../../../components/ui/Toast";

const ItemStatusConfig: Record<ItemStatus, string> = {
  Ready: "bg-green-100 text-green-600",
  Packaging: "bg-amber-100 text-amber-600",
  "Out of Stock": "bg-red-100 text-red-600",
};

// --- AI COMPONENT ---
const AIInsightCard = ({
  order,
  onAction,
}: {
  order: Order;
  onAction: (msg: string) => void;
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    // Simulate AI Analysis Delay
    const timer = setTimeout(() => {
      // Mock Logic based on Order Data
      const isHighValue = order.totalAmount > 5000000;
      // Mock simple fraud detection logic
      const isNewUser = order.customerName.includes("New");

      let riskScore = 5;
      let riskLevel = "LOW";
      let persona = "👑 Potential customers";
      let tags = ["Likes technology", "Online payments"];
      let actionType = "LOYALTY"; // LOYALTY | RISK | VERIFY
      let nextAction = "Send a thank-you email and offer a 5% discount code for your next order.";
      let actionLabel = "Send Voucher";

      if (order.paymentStatus === "UNPAID" && isHighValue) {
        riskScore = 65;
        riskLevel = "MEDIUM";
        actionType = "VERIFY";
        nextAction =
          "High-value order not paid. Should call to confirm address before shipping.";
        actionLabel = "Call to Verify";
        persona = "⚠️ Needs Attention";
      } else if (isHighValue) {
        riskScore = 10;
        persona = "💎 Potential VIP Customer";
        actionType = "LOYALTY";
        nextAction =
          "Potential high-value customer. Consider offering a 10% discount to retain them.";
        actionLabel = "Offer VIP Discount";
      }

      setAnalysis({
        riskScore,
        riskLevel,
        persona,
        nextAction,
        actionLabel,
        actionType,
        tags,
      });
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [order]);

  const handleAIAction = () => {
    // Simulate action execution
    onAction(`AI Action Executed: ${analysis.actionLabel}`);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] border border-indigo-100 shadow-sm p-6 relative overflow-hidden transition-all hover:shadow-md">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <BrainCircuit size={100} className="text-indigo-600" />
      </div>
      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <Sparkles size={14} className="animate-pulse" /> AI Analysis
      </h3>

      {isAnalyzing ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200/50 rounded w-1/2"></div>
          <div className="h-10 bg-indigo-200/50 rounded-xl mt-4"></div>
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          {/* Risk Assessment */}
          <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-indigo-100 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${analysis.riskLevel === "LOW" ? "bg-green-100 text-green-600" : analysis.riskLevel === "MEDIUM" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Order Risk
                </p>
                <p
                  className={`text-sm font-black ${analysis.riskLevel === "LOW" ? "text-green-700" : analysis.riskLevel === "MEDIUM" ? "text-amber-700" : "text-red-700"}`}
                >
                  {analysis.riskLevel === "LOW"
                    ? "Safe (Low)"
                    : analysis.riskLevel === "MEDIUM"
                      ? "Needs Attention (Medium)"
                      : "High Risk (High)"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xl font-black ${analysis.riskScore > 50 ? "text-red-500" : "text-indigo-600"}`}
              >
                {analysis.riskScore}/100
              </span>
            </div>
          </div>

          {/* Customer Persona */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Fingerprint size={12} /> Customer Persona
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-white border border-purple-100 text-purple-700 text-xs font-bold rounded-lg shadow-sm">
                {analysis.persona}
              </span>
              {analysis.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white border border-slate-100 text-slate-600 text-xs font-medium rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendation & Action */}
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
            <div className="flex gap-3 mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg h-fit">
                <Lightbulb size={16} className="text-yellow-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-200 uppercase mb-1">
                  AI Recommendation
                </p>
                <p className="text-xs font-medium text-white leading-relaxed opacity-90">
                  {analysis.nextAction}
                </p>
              </div>
            </div>

            <button
              onClick={handleAIAction}
              className="w-full py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {analysis.actionType === "VERIFY" ? (
                <Phone size={14} />
              ) : (
                <Gift size={14} />
              )}
              {analysis.actionLabel} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const fetchOrder = useCallback(() => {
    if (id) {
      setLoading(true);
      getOrderById(id).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading)
    return (
      <div className="p-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-400">Loading...</p>
      </div>
    );
  if (!order)
    return (
      <div className="p-20 text-center text-red-500 font-bold">
        Order not found.
      </div>
    );

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-8 max-w-[1200px] mx-auto pb-20">
      {toast && (
        <ToastComponent
          toast={{ id: "toast-1", message: toast.message, type: toast.type }}
          onClose={() => setToast(null)}
        />
      )}

      {/* 1. Order Information Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/orders")}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all border-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Order Details {order.orderCode}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === "PENDING" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}
              >
                {order.status}
              </span>
              <span className="text-xs font-bold text-slate-400">|</span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === "PAID" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}`}
              >
                {order.paymentStatus}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all border-0 shadow-sm no-print"
          >
            <Printer size={18} /> Print invoice
          </button>
        </div>
      </div>

      {/* 2. Progress Timeline Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
          Progress Timeline:
        </h3>

        {/* Order Level Timeline */}
        <div className="mb-8 pb-8 border-b border-slate-100">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
            Order Overview:
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
            <div className="absolute top-4 left-4 md:left-0 md:right-0 md:h-[2px] bg-slate-100 -z-0 hidden md:block"></div>

            {[
              {
                label: "Order Confirmed",
                time: "10 Sep 2023, 14:30",
                done: true,
              },
              {
                label: "Payment Received",
                time: "10 Sep 2023, 14:35",
                done: true,
              },
              {
                label: "Processing",
                time: "In Progress",
                done: false,
                active: true,
              },
              { label: "Shipping", time: "(Pending)", done: false },
              { label: "Completed", time: "(Pending)", done: false },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-row md:flex-col items-center gap-4 relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-md ${step.done ? "bg-green-500 text-white" : step.active ? "bg-blue-500 text-white animate-pulse" : "bg-slate-200 text-slate-400"}`}
                >
                  {step.done ? (
                    <Check size={14} strokeWidth={4} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <div className="text-left md:text-center">
                  <p
                    className={`text-xs font-black uppercase tracking-wider ${step.done || step.active ? "text-slate-800" : "text-slate-400"}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    {step.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipment Level Timeline */}
        {order.shipments && order.shipments.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              Timeline of shipments:
            </p>
            <div className="space-y-4">
              {order.shipments.map((shipment) => {
                const statusSteps = [
                  { label: "Pending", value: "PENDING", done: false },
                  {
                    label: "Confirmed",
                    value: "CONFIRMED",
                    done: [
                      "CONFIRMED",
                      "PICKED_UP",
                      "SHIPPING",
                      "DELIVERING",
                      "DELIVERED",
                    ].includes(shipment.shipping_status),
                  },
                  {
                    label: "Picked Up",
                    value: "PICKED_UP",
                    done: [
                      "PICKED_UP",
                      "SHIPPING",
                      "DELIVERING",
                      "DELIVERED",
                    ].includes(shipment.shipping_status),
                  },
                  {
                    label: "Shipping",
                    value: "SHIPPING",
                    done: ["SHIPPING", "DELIVERING", "DELIVERED"].includes(
                      shipment.shipping_status,
                    ),
                  },
                  {
                    label: "Delivering",
                    value: "DELIVERING",
                    done: ["DELIVERING", "DELIVERED"].includes(
                      shipment.shipping_status,
                    ),
                  },
                  {
                    label: "Delivered",
                    value: "DELIVERED",
                    done: shipment.shipping_status === "DELIVERED",
                  },
                ];

                return (
                  <div
                    key={shipment.id}
                    className="bg-slate-50/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-700">
                        {shipment.shopName} -{" "}
                        <span className="text-blue-600">
                          {shipment.tracking_number}
                        </span>
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          shipment.shipping_status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : shipment.shipping_status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {shipment.shipping_status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {statusSteps.map((step) => (
                        <div
                          key={step.value}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold ${
                            step.done
                              ? "bg-green-100 text-green-700"
                              : step.value === shipment.shipping_status
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {step.done && <Check size={12} />}
                          {step.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Products & Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3. Products Table */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                Products:
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {item.productName}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ItemStatusConfig[item.status] || "bg-slate-100 text-slate-600"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-800">
                        x{item.quantity}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">
                        {item.price.toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-400 text-sm"
                      >
                        There are no products in the order yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.5. Shipments Section (Multi-Tracking) */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  📦 Shipments & Shipping ({order.shipments.length}):
                </h3>
                <div className="space-y-4">
                  {order.shipments.map((shipment) => (
                    <ShipmentCard
                      key={shipment.id}
                      shipment={shipment}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Order Summary Section */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              Order Summary:
            </h3>
            <div className="space-y-4 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Sub Total:</span>
                <span className="text-slate-800 font-black">
                  {order.subtotalAmount.toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Discount:</span>
                <span className="text-red-500 font-black">
                  -{order.discountAmount.toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Shipping:</span>
                <span className="text-slate-800 font-black">
                  {order.shippingAmount.toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Tax (10%):</span>
                <span className="text-slate-800 font-black">
                  {order.taxAmount.toLocaleString()}₫
                </span>
              </div>
              <div className="h-px bg-slate-100 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-800 uppercase tracking-widest">
                  Total:
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {order.totalAmount.toLocaleString()}₫
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-8">
          {/* AI Insight Card (New Feature) */}
          <AIInsightCard
            order={order}
            onAction={(msg) => setToast({ message: msg, type: "success" })}
          />

          {/* 5. Payment Information */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <CreditCard size={16} /> Payment Information:
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Payment Method
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Transaction ID
                </p>
                <p className="text-sm font-bold text-blue-600 tracking-wider uppercase">
                  {order.transactionId || "---"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Paid At
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* 6. Customer Information */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <User size={16} /> Customer Information:
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {order.customerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    {order.customerName}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    {order.customerEmail}
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="text-slate-300 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Shipping Address
                    </p>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      {order.shippingAddress}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText
                    size={16}
                    className="text-slate-300 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Billing Address
                    </p>
                    <p className="text-xs text-slate-400 font-bold italic">
                      Same as shipping address
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .bg-white, .bg-slate-50, .bg-slate-900 { border-radius: 0 !important; border: 1px solid #eee !important; box-shadow: none !important; }
          .p-6, .p-8 { padding: 10px !important; }
        }
      `}</style>
    </div>
  );
}
