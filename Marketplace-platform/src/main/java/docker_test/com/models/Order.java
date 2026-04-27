package docker_test.com.models;

import java.time.LocalDateTime;

public final class Order {
    private Long order_id;
    private String order_number;
    private Long user_id;
    private Long shop_id;
    private Long address_id;
    private Double total_amount;
    private Double shipping_fee;
    private Double discount_amount;
    private Double final_amount;
    private String payment_method;
    private String payment_status;
    private String order_status;
    private String note;
    private Long voucher_id;
    private String tracking_number;
    private String cancelled_reason;
    private LocalDateTime cancelled_at;
    private LocalDateTime delivered_at;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    // Enriched fields (joined from user + order_item tables)
    private String customer_name;
    private String customer_email;
    private String customer_phone;
    private int items_count;

    public Order() {
        this.shipping_fee = 0.0;
        this.discount_amount = 0.0;
        this.final_amount = 0.0;
        this.payment_status = "pending";
        this.order_status = "pending";
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Order(Long order_id, String order_number, Long user_id, Long shop_id, Long address_id,
                 Double total_amount, Double shipping_fee, Double discount_amount,
                 Double final_amount, String payment_method, String payment_status,
                 String order_status, String note, Long voucher_id, String tracking_number,
                 String cancelled_reason, LocalDateTime cancelled_at, LocalDateTime delivered_at,
                 LocalDateTime created_at, LocalDateTime updated_at) {
        this.order_id = order_id;
        this.order_number = order_number;
        this.user_id = user_id;
        this.shop_id = shop_id;
        this.address_id = address_id;
        this.total_amount = total_amount;
        this.shipping_fee = shipping_fee;
        this.discount_amount = discount_amount;
        this.final_amount = final_amount;
        this.payment_method = payment_method;
        this.payment_status = payment_status;
        this.order_status = order_status;
        this.note = note;
        this.voucher_id = voucher_id;
        this.tracking_number = tracking_number;
        this.cancelled_reason = cancelled_reason;
        this.cancelled_at = cancelled_at;
        this.delivered_at = delivered_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public Long getOrderId() { return order_id; }
    public void setOrderId(long order_id) { this.order_id = order_id; }
    
    public String getOrderNumber() { return order_number; }
    public void setOrderNumber(String order_number) { this.order_number = order_number; }
    
    public Long getUserId() { return user_id; }
    public void setUserId(long user_id) { this.user_id = user_id; }
    
    public Long getShopId() { return shop_id; }
    public void setShopId(long shop_id) { this.shop_id = shop_id; }
    
    public Long getAddressId() { return address_id; }
    public void setAddressId(long address_id) { this.address_id = address_id; }
    
    public Double getTotalAmount() { return total_amount; }
    public void setTotalAmount(Double total_amount) { this.total_amount = total_amount; }
    
    public Double getShippingFee() { return shipping_fee; }
    public void setShippingFee(Double shipping_fee) { this.shipping_fee = shipping_fee; }
    
    public Double getDiscountAmount() { return discount_amount; }
    public void setDiscountAmount(Double discount_amount) { this.discount_amount = discount_amount; }
    
    public Double getFinalAmount() { return final_amount; }
    public void setFinalAmount(Double final_amount) { this.final_amount = final_amount; }
    
    public String getPaymentMethod() { return payment_method; }
    public void setPaymentMethod(String payment_method) { this.payment_method = payment_method; }
    
    public String getPaymentStatus() { return payment_status; }
    public void setPaymentStatus(String payment_status) { this.payment_status = payment_status; }
    
    public String getOrderStatus() { return order_status; }
    public void setOrderStatus(String order_status) { this.order_status = order_status; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    
    public Long getVoucherId() { return voucher_id; }
    public void setVoucherId(Long voucher_id) { this.voucher_id = voucher_id; }
    
    public String getTrackingNumber() { return tracking_number; }
    public void setTrackingNumber(String tracking_number) { this.tracking_number = tracking_number; }
    
    public String getCancelledReason() { return cancelled_reason; }
    public void setCancelledReason(String cancelled_reason) { this.cancelled_reason = cancelled_reason; }
    
    public LocalDateTime getCancelledAt() { return cancelled_at; }
    public void setCancelledAt(LocalDateTime cancelled_at) { this.cancelled_at = cancelled_at; }
    
    public LocalDateTime getDeliveredAt() { return delivered_at; }
    public void setDeliveredAt(LocalDateTime delivered_at) { this.delivered_at = delivered_at; }
    
    public LocalDateTime getCreatedAt() { return created_at; }
    public void setCreatedAt(LocalDateTime created_at) { this.created_at = created_at; }
    
    public LocalDateTime getUpdatedAt() { return updated_at; }
    public void setUpdatedAt(LocalDateTime updated_at) { this.updated_at = updated_at; }

    public String getCustomerName() { return customer_name; }
    public void setCustomerName(String customer_name) { this.customer_name = customer_name; }

    public String getCustomerEmail() { return customer_email; }
    public void setCustomerEmail(String customer_email) { this.customer_email = customer_email; }

    public String getCustomerPhone() { return customer_phone; }
    public void setCustomerPhone(String customer_phone) { this.customer_phone = customer_phone; }

    public int getItemsCount() { return items_count; }
    public void setItemsCount(int items_count) { this.items_count = items_count; }
}