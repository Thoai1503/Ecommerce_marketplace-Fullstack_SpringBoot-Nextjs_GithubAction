package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public final class VoucherUsageHistory {
    private long usageId;
    private long voucherId;
    private long userId;
    private long orderId;
    private Double discountAmount;
    private LocalDateTime appliedAt;

    public VoucherUsageHistory() {
        this.appliedAt = LocalDateTime.now();
    }

    public VoucherUsageHistory(long usageId, long voucherId, long userId, long orderId, 
                               Double discountAmount, LocalDateTime appliedAt) {
        this.usageId = usageId;
        this.voucherId = voucherId;
        this.userId = userId;
        this.orderId = orderId;
        this.discountAmount = discountAmount;
        this.appliedAt = appliedAt;
    }

    // Getters and Setters
    public long getUsageId() { return usageId; }
    public void setUsageId(long usageId) { this.usageId = usageId; }

    public long getVoucherId() { return voucherId; }
    public void setVoucherId(long voucherId) { this.voucherId = voucherId; }

    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }

    public long getOrderId() { return orderId; }
    public void setOrderId(long orderId) { this.orderId = orderId; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}