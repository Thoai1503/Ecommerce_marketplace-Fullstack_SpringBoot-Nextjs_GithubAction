package docker_test.com.dto;

import java.time.LocalDateTime;

import docker_test.com.repository.AdminOrderListProjection;

public class AdminOrderListItemDTO {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private Long addressId;
    private Double totalAmount;
    private Long shippingFee;
    private Long discountAmount;
    private Long finalAmount;
    private String paymentStatus;
    private String paymentMethod;
    private String orderStatus;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer itemsCount;
    private Integer shipmentsCount;

    public static AdminOrderListItemDTO fromProjection(AdminOrderListProjection p) {
        AdminOrderListItemDTO dto = new AdminOrderListItemDTO();
        dto.setId(p.getId());
        dto.setOrderId(p.getOrderId());
        dto.setOrderNumber(p.getOrderNumber());
        dto.setUserId(p.getUserId());
        dto.setAddressId(p.getAddressId());
        dto.setTotalAmount(p.getTotalAmount());
        dto.setShippingFee(p.getShippingFee());
        dto.setDiscountAmount(p.getDiscountAmount());
        dto.setFinalAmount(p.getFinalAmount());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setOrderStatus(p.getOrderStatus());
        dto.setTrackingNumber(p.getTrackingNumber());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        dto.setCustomerName(p.getCustomerName());
        dto.setCustomerEmail(p.getCustomerEmail());
        dto.setCustomerPhone(p.getCustomerPhone());
        dto.setItemsCount(p.getItemsCount());
        dto.setShipmentsCount(p.getShipmentsCount());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Long getShippingFee() { return shippingFee; }
    public void setShippingFee(Long shippingFee) { this.shippingFee = shippingFee; }
    public Long getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Long discountAmount) { this.discountAmount = discountAmount; }
    public Long getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Long finalAmount) { this.finalAmount = finalAmount; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public Integer getItemsCount() { return itemsCount; }
    public void setItemsCount(Integer itemsCount) { this.itemsCount = itemsCount; }
    public Integer getShipmentsCount() { return shipmentsCount; }
    public void setShipmentsCount(Integer shipmentsCount) { this.shipmentsCount = shipmentsCount; }
}
