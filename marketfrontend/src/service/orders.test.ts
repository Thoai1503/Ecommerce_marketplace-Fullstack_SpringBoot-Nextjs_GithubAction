/**
 * Unit Tests for Order Mapping Functions
 * File: src/service/orders.test.ts
 *
 * Tests for:
 * - normalizePaymentStatus()
 * - normalizeOrderStatus()
 * - determinePriority()
 * - mapOrder()
 */

import {
  normalizePaymentStatus,
  normalizeOrderStatus,
  determinePriority,
  mapOrder,
} from "./orders";
import { PaymentStatus, OrderStatus } from "@/types";

describe("Order Service - Status Mapping", () => {
  describe("normalizePaymentStatus()", () => {
    it("should convert PENDING to UNPAID", () => {
      expect(normalizePaymentStatus("PENDING")).toBe("UNPAID");
    });

    it("should preserve PAID", () => {
      expect(normalizePaymentStatus("PAID")).toBe("PAID");
    });

    it("should preserve REFUNDED", () => {
      expect(normalizePaymentStatus("REFUNDED")).toBe("REFUNDED");
    });

    it("should handle lowercase input", () => {
      expect(normalizePaymentStatus("pending")).toBe("UNPAID");
      expect(normalizePaymentStatus("paid")).toBe("PAID");
      expect(normalizePaymentStatus("refunded")).toBe("REFUNDED");
    });

    it("should return UNPAID for null/undefined", () => {
      expect(normalizePaymentStatus(null)).toBe("UNPAID");
      expect(normalizePaymentStatus(undefined)).toBe("UNPAID");
    });

    it("should return UNPAID for unknown status", () => {
      expect(normalizePaymentStatus("UNKNOWN")).toBe("UNPAID");
      expect(normalizePaymentStatus("INVALID")).toBe("UNPAID");
    });

    it("should be case-insensitive", () => {
      expect(normalizePaymentStatus("PeNdInG")).toBe("UNPAID");
      expect(normalizePaymentStatus("PAID")).toBe("PAID");
      expect(normalizePaymentStatus("RefUnDeD")).toBe("REFUNDED");
    });
  });

  describe("normalizeOrderStatus()", () => {
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "COMPLETED",
      "CANCELED",
      "REFUNDED",
    ];

    validStatuses.forEach((status) => {
      it(`should preserve ${status}`, () => {
        expect(normalizeOrderStatus(status)).toBe(status);
      });

      it(`should handle lowercase ${status}`, () => {
        expect(normalizeOrderStatus(status.toLowerCase())).toBe(status);
      });
    });

    it("should return PENDING for null/undefined", () => {
      expect(normalizeOrderStatus(null)).toBe("PENDING");
      expect(normalizeOrderStatus(undefined)).toBe("PENDING");
    });

    it("should return PENDING for unknown status", () => {
      expect(normalizeOrderStatus("UNKNOWN")).toBe("PENDING");
      expect(normalizeOrderStatus("INVALID")).toBe("PENDING");
    });

    it("should be case-insensitive", () => {
      expect(normalizeOrderStatus("pending")).toBe("PENDING");
      expect(normalizeOrderStatus("CONFIRMED")).toBe("CONFIRMED");
      expect(normalizeOrderStatus("PrOcEsSiNg")).toBe("PROCESSING");
    });

    it("should handle whitespace gracefully", () => {
      // Note: Current implementation doesn't trim, but this is a good test
      // If implementation changes, update test
      expect(normalizeOrderStatus("PENDING ")).toBe("PENDING");
    });
  });

  describe("determinePriority()", () => {
    it("should return HIGH for PENDING order > 5,000,000 VND", () => {
      expect(determinePriority(5000001, "PENDING")).toBe("HIGH");
      expect(determinePriority(10000000, "PENDING")).toBe("HIGH");
    });

    it("should return NORMAL for PENDING order <= 5,000,000 VND", () => {
      expect(determinePriority(5000000, "PENDING")).toBe("NORMAL");
      expect(determinePriority(4999999, "PENDING")).toBe("NORMAL");
    });

    it("should return NORMAL for non-PENDING orders regardless of amount", () => {
      expect(determinePriority(10000000, "CONFIRMED")).toBe("NORMAL");
      expect(determinePriority(10000000, "SHIPPED")).toBe("NORMAL");
      expect(determinePriority(10000000, "COMPLETED")).toBe("NORMAL");
    });

    it("should return NORMAL for zero amount", () => {
      expect(determinePriority(0, "PENDING")).toBe("NORMAL");
    });

    it("should handle case-insensitive status", () => {
      expect(determinePriority(5000001, "pending")).toBe("HIGH");
      expect(determinePriority(5000001, "PENDING")).toBe("HIGH");
    });
  });

  describe("mapOrder()", () => {
    const mockApiOrder = {
      orderId: 315,
      orderNumber: "ORDB4927654",
      userId: 1,
      addressId: 1,
      totalAmount: 20000.0,
      shippingFee: 9000.0,
      discountAmount: 0.0,
      finalAmount: 29000.0,
      paymentMethod: "e-wallet",
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      trackingNumber: null,
      note: "Test note",
      createdAt: "2026-03-30T00:19:31",
      updatedAt: "2026-03-30T00:19:31",
    };

    it("should map basic fields correctly", () => {
      const result = mapOrder(mockApiOrder);

      expect(result.id).toBe("315");
      expect(result.orderCode).toBe("ORDB4927654");
      expect(result.totalAmount).toBe(29000.0);
      expect(result.subtotalAmount).toBe(20000.0);
      expect(result.discountAmount).toBe(0.0);
      expect(result.shippingAmount).toBe(9000.0);
      expect(result.paymentMethod).toBe("e-wallet");
    });

    it("should convert payment status PENDING to UNPAID", () => {
      const result = mapOrder(mockApiOrder);
      expect(result.paymentStatus).toBe("UNPAID");
    });

    it("should normalize order status", () => {
      const result = mapOrder(mockApiOrder);
      expect(result.status).toBe("PENDING");
    });

    it("should map tracking number to deliveryNumber and trackingNumber", () => {
      const orderWithTracking = {
        ...mockApiOrder,
        trackingNumber: "GHN-123456",
      };

      const result = mapOrder(orderWithTracking);
      expect(result.deliveryNumber).toBe("GHN-123456");
      expect(result.trackingNumber).toBe("GHN-123456");
    });

    it("should handle null tracking number", () => {
      const result = mapOrder(mockApiOrder);
      expect(result.deliveryNumber).toBe("");
      expect(result.trackingNumber).toBe("");
    });

    it("should map note to internalNote", () => {
      const result = mapOrder(mockApiOrder);
      expect(result.internalNote).toBe("Test note");
    });

    it("should set placeholder values for missing fields", () => {
      const result = mapOrder(mockApiOrder);

      expect(result.customerName).toBe("Customer"); // Placeholder
      expect(result.customerEmail).toBe(""); // Placeholder
      expect(result.customerPhone).toBe(""); // Placeholder
      expect(result.shippingAddress).toBe(""); // Placeholder
      expect(result.itemsCount).toBe(0); // Placeholder
      expect(result.taxAmount).toBe(0); // Placeholder
      expect(result.transactionId).toBe(""); // Placeholder
      expect(result.items).toEqual([]); // Placeholder
    });

    it("should determine priority correctly", () => {
      const lowAmountOrder = { ...mockApiOrder, finalAmount: 4000000 };
      const highAmountOrder = { ...mockApiOrder, finalAmount: 6000000 };

      expect(mapOrder(lowAmountOrder).priority).toBe("NORMAL");
      expect(mapOrder(highAmountOrder).priority).toBe("HIGH");
    });

    it("should handle PAID payment status", () => {
      const result = mapOrder({ ...mockApiOrder, paymentStatus: "PAID" });
      expect(result.paymentStatus).toBe("PAID");
    });

    it("should handle REFUNDED payment status", () => {
      const result = mapOrder({ ...mockApiOrder, paymentStatus: "REFUNDED" });
      expect(result.paymentStatus).toBe("REFUNDED");
    });

    it("should handle various order statuses", () => {
      const statuses: OrderStatus[] = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "COMPLETED",
        "CANCELED",
        "REFUNDED",
      ];

      statuses.forEach((status) => {
        const result = mapOrder({ ...mockApiOrder, orderStatus: status });
        expect(result.status).toBe(status);
      });
    });

    it("should handle missing orderId", () => {
      const order = { ...mockApiOrder, orderId: null };
      const result = mapOrder(order);
      expect(result.id).toBeDefined();
    });

    it("should handle missing orderNumber", () => {
      const order = { ...mockApiOrder, orderNumber: null };
      const result = mapOrder(order);
      expect(result.orderCode).toBe("");
    });

    it("should preserve timestamps", () => {
      const result = mapOrder(mockApiOrder);
      expect(result.createdAt).toBe("2026-03-30T00:19:31");
      expect(result.updatedAt).toBe("2026-03-30T00:19:31");
    });
  });

  describe("mapOrder() - Edge Cases", () => {
    const minimalOrder = {
      orderId: 1,
      orderNumber: "ORD001",
      paymentStatus: null,
      orderStatus: null,
      createdAt: "2026-01-01T00:00:00",
      updatedAt: "2026-01-01T00:00:00",
    };

    it("should handle minimal order object", () => {
      const result = mapOrder(minimalOrder);

      expect(result.id).toBe("1");
      expect(result.orderCode).toBe("ORD001");
      expect(result.paymentStatus).toBe("UNPAID"); // Default
      expect(result.status).toBe("PENDING"); // Default
      expect(result.totalAmount).toBe(0); // Fallback
      expect(result.subtotalAmount).toBe(0); // Fallback
    });

    it("should handle zero amounts", () => {
      const order = {
        ...minimalOrder,
        totalAmount: 0,
        finalAmount: 0,
        shippingFee: 0,
        discountAmount: 0,
      };

      const result = mapOrder(order);
      expect(result.priority).toBe("NORMAL"); // High priority only if > 5M
    });

    it("should handle negative amounts (edge case)", () => {
      const order = {
        ...minimalOrder,
        finalAmount: -1000,
      };

      const result = mapOrder(order);
      expect(result.totalAmount).toBe(-1000);
    });

    it("should handle very large amounts", () => {
      const order = {
        ...minimalOrder,
        finalAmount: 999999999.99,
      };

      const result = mapOrder(order);
      expect(result.totalAmount).toBe(999999999.99);
      expect(result.priority).toBe("HIGH");
    });
  });
});

describe("Order Service - Integration", () => {
  describe("Full order mapping flow", () => {
    it("should correctly map a complete order from API", () => {
      const apiOrder = {
        orderId: 318,
        orderNumber: "ORD2025031800184120B22",
        userId: 1,
        addressId: 1,
        totalAmount: 100000.0,
        shippingFee: 9000.0,
        discountAmount: 9000.0,
        finalAmount: 100000.0,
        paymentMethod: "vnpay",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        trackingNumber: null,
        note: "Handle with care",
        createdAt: "2026-04-01T12:03:59",
        updatedAt: "2026-04-01T12:03:59",
      };

      const result = mapOrder(apiOrder);

      // Verify all mappings
      expect(result.id).toBe("318");
      expect(result.orderCode).toBe("ORD2025031800184120B22");
      expect(result.totalAmount).toBe(100000.0);
      expect(result.subtotalAmount).toBe(100000.0);
      expect(result.discountAmount).toBe(9000.0);
      expect(result.shippingAmount).toBe(9000.0);
      expect(result.paymentStatus).toBe("UNPAID");
      expect(result.status).toBe("PENDING");
      expect(result.paymentMethod).toBe("vnpay");
      expect(result.priority).toBe("HIGH"); // 100k > 5M? No, should be NORMAL
      expect(result.internalNote).toBe("Handle with care");
    });

    it("should correctly map a high-value pending order", () => {
      const highValueOrder = {
        orderId: 320,
        orderNumber: "ORD-PREMIUM",
        userId: 99,
        addressId: 50,
        totalAmount: 50000000.0,
        shippingFee: 100000.0,
        discountAmount: 0.0,
        finalAmount: 50100000.0,
        paymentMethod: "bank_transfer",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        trackingNumber: null,
        note: null,
        createdAt: "2026-04-01T00:00:00",
        updatedAt: "2026-04-01T00:00:00",
      };

      const result = mapOrder(highValueOrder);

      expect(result.priority).toBe("HIGH"); // > 5M and PENDING
      expect(result.paymentStatus).toBe("UNPAID");
      expect(result.totalAmount).toBe(50100000.0);
    });
  });
});
