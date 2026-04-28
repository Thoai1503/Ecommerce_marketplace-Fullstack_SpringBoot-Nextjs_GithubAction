"use client";

import { useState } from "react";
import { X, Clock, TrendingUp, MapPin, CreditCard } from "lucide-react";
import {
  PaymentTransaction,
  PaymentStatusHistory,
  PaymentTxnStatus,
} from "@/types/index";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TransactionDetailModalProps {
  transaction: PaymentTransaction | undefined;
  history: PaymentStatusHistory[];
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onStatusChange?: (status: PaymentTxnStatus, reason?: string) => Promise<void>;
  isUpdating?: boolean;
}

const STATUS_COLORS: Record<PaymentTxnStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  EXPIRED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-purple-100 text-purple-800",
};

const VALID_STATUS_TRANSITIONS: Record<PaymentTxnStatus, PaymentTxnStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED", "EXPIRED"],
  PROCESSING: ["SUCCESS", "FAILED"],
  SUCCESS: ["REFUNDED"],
  FAILED: ["CANCELLED"],
  CANCELLED: [],
  EXPIRED: [],
  REFUNDED: [],
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  history,
  isOpen,
  onClose,
  isLoading,
  onStatusChange,
  isUpdating,
}) => {
  const [selectedNewStatus, setSelectedNewStatus] = useState<
    PaymentTxnStatus | ""
  >("");
  const [changeReason, setChangeReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!transaction || !isOpen) return null;

  const validNextStatuses = VALID_STATUS_TRANSITIONS[transaction.status] || [];
  const sortedHistory = [...history].reverse();

  const handleStatusChange = async () => {
    if (!selectedNewStatus || !onStatusChange) return;

    setIsUpdatingStatus(true);
    try {
      await onStatusChange(selectedNewStatus as PaymentTxnStatus, changeReason);
      setSelectedNewStatus("");
      setChangeReason("");
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">{transaction.txnCode}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading transaction details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[transaction.status]}`}
                    >
                      {transaction.status}
                    </span>
                    {transaction.completedAt && (
                      <span className="text-xs text-gray-500">
                        {formatDateTime(transaction.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Transaction Code</p>
                    <p className="font-mono text-sm font-medium">
                      {transaction.txnCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Transaction Type</p>
                    <p className="text-sm font-medium">{transaction.txnType}</p>
                  </div>
                  {transaction.refCode && (
                    <div>
                      <p className="text-xs text-gray-600">Reference Code</p>
                      <p className="text-sm font-medium">
                        {transaction.refCode}
                      </p>
                    </div>
                  )}
                  {transaction.refType && (
                    <div>
                      <p className="text-xs text-gray-600">Reference Type</p>
                      <p className="text-sm font-medium">
                        {transaction.refType}
                      </p>
                    </div>
                  )}
                  {transaction.orderId && (
                    <div>
                      <p className="text-xs text-gray-600">Order ID</p>
                      <p className="text-sm font-medium">
                        {transaction.orderId}
                      </p>
                    </div>
                  )}
                  {transaction.orderNumber && (
                    <div>
                      <p className="text-xs text-gray-600">Order Number</p>
                      <p className="font-mono text-sm font-medium">
                        {transaction.orderNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Financial Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Gross Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.grossAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fee Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.feeAmount)}
                    </p>
                  </div>
                  {transaction.discountAmount > 0 && (
                    <div>
                      <p className="text-xs text-gray-600">Discount Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(transaction.discountAmount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600">Net Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(transaction.netAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Currency</p>
                    <p className="text-sm font-medium">
                      {transaction.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payer & Payee Information */}
              <div className="grid grid-cols-2 gap-4">
                {transaction.payerId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Payer
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Type</p>
                        <p className="text-sm font-medium">
                          {transaction.payerType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID</p>
                        <p className="font-mono text-sm">
                          {transaction.payerId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {transaction.payeeId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Payee
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Type</p>
                        <p className="text-sm font-medium">
                          {transaction.payeeType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID</p>
                        <p className="font-mono text-sm">
                          {transaction.payeeId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Information */}
              {transaction.paymentMethod && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Method</p>
                      <p className="text-sm font-medium">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                    {transaction.gatewayCode && (
                      <div>
                        <p className="text-xs text-gray-600">Gateway Code</p>
                        <p className="font-mono text-sm">
                          {transaction.gatewayCode}
                        </p>
                      </div>
                    )}
                    {transaction.bankCode && (
                      <div>
                        <p className="text-xs text-gray-600">Bank Code</p>
                        <p className="text-sm font-medium">
                          {transaction.bankCode}
                        </p>
                      </div>
                    )}
                    {transaction.cardType && (
                      <div>
                        <p className="text-xs text-gray-600">Card Type</p>
                        <p className="text-sm font-medium">
                          {transaction.cardType}
                        </p>
                      </div>
                    )}
                  </div>
                  {transaction.gatewayResponseMsg && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600">Gateway Response</p>
                      <p className="text-sm text-gray-700">
                        {transaction.gatewayResponseMsg}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status History Timeline */}
              {sortedHistory.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Status History ({sortedHistory.length})
                  </h3>
                  <div className="space-y-3">
                    {sortedHistory.map((entry, index) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5"></div>
                          {index < sortedHistory.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[entry.fromStatus as PaymentTxnStatus] || "bg-gray-100 text-gray-800"}`}
                              >
                                {entry.fromStatus || "Initial"}
                              </span>
                              <span className="text-gray-500">→</span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[entry.toStatus]}`}
                              >
                                {entry.toStatus}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(entry.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            <p>
                              Changed by:{" "}
                              <span className="font-medium">
                                {entry.changedBy}
                              </span>
                              {entry.actorId && ` (ID: ${entry.actorId})`}
                            </p>
                            {entry.reason && (
                              <p className="mt-0.5 italic text-gray-700">
                                Reason: {entry.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline of Dates */}
              {(transaction.createdAt ||
                transaction.expiredAt ||
                transaction.confirmedAt) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">
                    Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    {transaction.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created At</span>
                        <span className="font-medium">
                          {formatDateTime(transaction.createdAt)}
                        </span>
                      </div>
                    )}
                    {transaction.confirmedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmed At</span>
                        <span className="font-medium">
                          {formatDateTime(transaction.confirmedAt)}
                        </span>
                      </div>
                    )}
                    {transaction.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed At</span>
                        <span className="font-medium">
                          {formatDateTime(transaction.completedAt)}
                        </span>
                      </div>
                    )}
                    {transaction.expiredAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires At</span>
                        <span className="font-medium">
                          {formatDateTime(transaction.expiredAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Change Section */}
              {validNextStatuses.length > 0 && onStatusChange && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">
                    Change Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Status
                      </label>
                      <select
                        value={selectedNewStatus}
                        onChange={(e) =>
                          setSelectedNewStatus(
                            e.target.value as PaymentTxnStatus,
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select new status</option>
                        {validNextStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason (Optional)
                      </label>
                      <textarea
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        placeholder="Enter reason for status change..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdatingStatus || isUpdating}
          >
            Close
          </Button>
          {validNextStatuses.length > 0 &&
            onStatusChange &&
            selectedNewStatus && (
              <Button
                onClick={handleStatusChange}
                disabled={isUpdatingStatus || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdatingStatus || isUpdating
                  ? "Updating..."
                  : "Update Status"}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};
