package docker_test.com.models.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Voucher {

	private long id;
	private Long shopId;

	private String voucherCode;
	private String voucherName;
	private String description;

	private DiscountType discountType;
	private BigDecimal discountValue;

	private BigDecimal minOrderValue;
	private BigDecimal maxDiscount;

	private Integer usageLimit;
	private int usedCount;

	private LocalDateTime startDate;
	private LocalDateTime endDate;

	private boolean active;
	private LocalDateTime createdAt;

	// ===== Constructor =====
	public Voucher() {
		this.minOrderValue = BigDecimal.ZERO;
		this.usedCount = 0;
		this.active = true;
	}

	// ===== Getters & Setters =====
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Long getShopId() {
		return shopId;
	}

	public void setShopId(Long shopId) {
		this.shopId = shopId;
	}

	public String getVoucherCode() {
		return voucherCode;
	}

	public void setVoucherCode(String voucherCode) {
		this.voucherCode = voucherCode;
	}

	public String getVoucherName() {
		return voucherName;
	}

	public void setVoucherName(String voucherName) {
		this.voucherName = voucherName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public DiscountType getDiscountType() {
		return discountType;
	}

	public void setDiscountType(DiscountType discountType) {
		this.discountType = discountType;
	}

	public BigDecimal getDiscountValue() {
		return discountValue;
	}

	public void setDiscountValue(BigDecimal discountValue) {
		this.discountValue = discountValue;
	}

	public BigDecimal getMinOrderValue() {
		return minOrderValue;
	}

	public void setMinOrderValue(BigDecimal minOrderValue) {
		this.minOrderValue = minOrderValue;
	}

	public BigDecimal getMaxDiscount() {
		return maxDiscount;
	}

	public void setMaxDiscount(BigDecimal maxDiscount) {
		this.maxDiscount = maxDiscount;
	}

	public Integer getUsageLimit() {
		return usageLimit;
	}

	public void setUsageLimit(Integer usageLimit) {
		this.usageLimit = usageLimit;
	}

	public int getUsedCount() {
		return usedCount;
	}

	public void setUsedCount(int usedCount) {
		this.usedCount = usedCount;
	}

	public LocalDateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDateTime startDate) {
		this.startDate = startDate;
	}

	public LocalDateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDateTime endDate) {
		this.endDate = endDate;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}