package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public final class Voucher {
    private long voucherId;
    private Long shopId;
    private String voucherCode;
    private String voucherName;
    private String description;
    private String discountType;
    private Double discountValue;
    private Double minOrderValue;
    private Double maxDiscount;
    private Integer usageLimit;
    private int usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int isActive;
    private LocalDateTime createdAt;

    public Voucher() {
        this.minOrderValue = 0.0;
        this.usedCount = 0;
        this.isActive = 1;
        this.createdAt = LocalDateTime.now();
    }

    public Voucher(long voucherId, Long shopId, String voucherCode, String voucherName,
                   String description, String discountType, Double discountValue,
                   Double minOrderValue, Double maxDiscount, Integer usageLimit,
                   int usedCount, LocalDateTime startDate, LocalDateTime endDate, int isActive,
                   LocalDateTime createdAt) {
        this.voucherId = voucherId;
        this.shopId = shopId;
        this.voucherCode = voucherCode;
        this.voucherName = voucherName;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minOrderValue = minOrderValue;
        this.maxDiscount = maxDiscount;
        this.usageLimit = usageLimit;
        this.usedCount = usedCount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public long getVoucherId() { return voucherId; }
    public void setVoucherId(long voucherId) { this.voucherId = voucherId; }
    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    public String getVoucherName() { return voucherName; }
    public void setVoucherName(String voucherName) { this.voucherName = voucherName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public Double getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(Double minOrderValue) { this.minOrderValue = minOrderValue; }
    public Double getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(Double maxDiscount) { this.maxDiscount = maxDiscount; }
    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }
    public int getUsedCount() { return usedCount; }
    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public int isActive() { return isActive; }
    public void setActive(int active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}