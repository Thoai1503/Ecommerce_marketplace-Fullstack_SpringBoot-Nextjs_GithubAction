package docker_test.com.models;

import java.time.LocalDateTime;

public final class Order {
    private long orderId;
    private String orderNumber;
    private long userId;
    private long shopId;
    private long addressId;
    private Double totalAmount;
    private Double shippingFee;
    private Double discountAmount;
    private Double finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String note;
    private Long voucherId;
    private String trackingNumber;
    private String cancelledReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Order() {
        this.shippingFee = 0.0;
        this.discountAmount = 0.0;
        this.finalAmount = 0.0;
        this.paymentStatus = "pending";
        this.orderStatus = "pending";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Order(long orderId, String orderNumber, long userId, long shopId, long addressId,
                 Double totalAmount, Double shippingFee, Double discountAmount,
                 Double finalAmount, String paymentMethod, String paymentStatus,
                 String orderStatus, String note, Long voucherId, String trackingNumber,
                 String cancelledReason, LocalDateTime cancelledAt, LocalDateTime deliveredAt,
                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.shopId = shopId;
        this.addressId = addressId;
        this.totalAmount = totalAmount;
        this.shippingFee = shippingFee;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.orderStatus = orderStatus;
        this.note = note;
        this.voucherId = voucherId;
        this.trackingNumber = trackingNumber;
        this.cancelledReason = cancelledReason;
        this.cancelledAt = cancelledAt;
        this.deliveredAt = deliveredAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public long getOrderId() { return orderId; }
    public void setOrderId(long orderId) { this.orderId = orderId; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }
    public long getShopId() { return shopId; }
    public void setShopId(long shopId) { this.shopId = shopId; }
    public long getAddressId() { return addressId; }
    public void setAddressId(long addressId) { this.addressId = addressId; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Double getShippingFee() { return shippingFee; }
    public void setShippingFee(Double shippingFee) { this.shippingFee = shippingFee; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getCancelledReason() { return cancelledReason; }
    public void setCancelledReason(String cancelledReason) { this.cancelledReason = cancelledReason; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

 