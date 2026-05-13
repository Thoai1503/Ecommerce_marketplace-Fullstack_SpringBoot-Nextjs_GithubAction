package docker_test.com.models.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Voucher {

	private Long id;
	private Long campaignId;

	private String code;
	private String title;
	private String description;

	private String issuerType;
	private Long issuerId;

	private String discountType;

	private BigDecimal discountPercent;
	private BigDecimal discountAmount;
	private BigDecimal maxDiscountAmount;

	private BigDecimal minOrderValue;
	private BigDecimal maxOrderValue;

	private Integer totalQuota;
	private Integer claimedCount;
	private Integer redeemedCount;

	private Integer perUserQuota;

	private Boolean stackable;

	private LocalDateTime claimStartAt;
	private LocalDateTime claimEndAt;

	private LocalDateTime validFrom;
	private LocalDateTime validTo;

	private String status; // DRAFT, ACTIVE, PAUSED...

	private Integer priority;

	private Long createdBy;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	// ===== Constructor =====
	public Voucher() {
		this.minOrderValue = BigDecimal.ZERO;
		this.claimedCount = 0;
		this.redeemedCount = 0;
		this.stackable = false;
		this.priority = 0;
	}

	public Voucher(Long id, Long campaignId, String code, String title, String description, String issuerType,
			Long issuerId, String discountType, BigDecimal discountPercent, BigDecimal discountAmount,
			BigDecimal maxDiscountAmount, BigDecimal minOrderValue, BigDecimal maxOrderValue, Integer totalQuota,
			Integer claimedCount, Integer redeemedCount, Integer perUserQuota, Boolean stackable,
			LocalDateTime claimStartAt, LocalDateTime claimEndAt, LocalDateTime validFrom, LocalDateTime validTo,
			String status, Integer priority, Long createdBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.campaignId = campaignId;
		this.code = code;
		this.title = title;
		this.description = description;
		this.issuerType = issuerType;
		this.issuerId = issuerId;
		this.discountType = discountType;
		this.discountPercent = discountPercent;
		this.discountAmount = discountAmount;
		this.maxDiscountAmount = maxDiscountAmount;
		this.minOrderValue = minOrderValue;
		this.maxOrderValue = maxOrderValue;
		this.totalQuota = totalQuota;
		this.claimedCount = claimedCount;
		this.redeemedCount = redeemedCount;
		this.perUserQuota = perUserQuota;
		this.stackable = stackable;
		this.claimStartAt = claimStartAt;
		this.claimEndAt = claimEndAt;
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.status = status;
		this.priority = priority;
		this.createdBy = createdBy;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	// ===== Getters & Setters =====

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getCampaignId() {
		return campaignId;
	}

	public void setCampaignId(Long campaignId) {
		this.campaignId = campaignId;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getIssuerType() {
		return issuerType;
	}

	public void setIssuerType(String issuerType) {
		this.issuerType = issuerType;
	}

	public Long getIssuerId() {
		return issuerId;
	}

	public void setIssuerId(Long issuerId) {
		this.issuerId = issuerId;
	}

	public String getDiscountType() {
		return discountType;
	}

	public void setDiscountType(String discountType) {
		this.discountType = discountType;
	}

	public BigDecimal getDiscountPercent() {
		return discountPercent;
	}

	public void setDiscountPercent(BigDecimal discountPercent) {
		this.discountPercent = discountPercent;
	}

	public BigDecimal getDiscountAmount() {
		return discountAmount;
	}

	public void setDiscountAmount(BigDecimal discountAmount) {
		this.discountAmount = discountAmount;
	}

	public BigDecimal getMaxDiscountAmount() {
		return maxDiscountAmount;
	}

	public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) {
		this.maxDiscountAmount = maxDiscountAmount;
	}

	public BigDecimal getMinOrderValue() {
		return minOrderValue;
	}

	public void setMinOrderValue(BigDecimal minOrderValue) {
		this.minOrderValue = minOrderValue;
	}

	public BigDecimal getMaxOrderValue() {
		return maxOrderValue;
	}

	public void setMaxOrderValue(BigDecimal maxOrderValue) {
		this.maxOrderValue = maxOrderValue;
	}

	public Integer getTotalQuota() {
		return totalQuota;
	}

	public void setTotalQuota(Integer totalQuota) {
		this.totalQuota = totalQuota;
	}

	public Integer getClaimedCount() {
		return claimedCount;
	}

	public void setClaimedCount(Integer claimedCount) {
		this.claimedCount = claimedCount;
	}

	public Integer getRedeemedCount() {
		return redeemedCount;
	}

	public void setRedeemedCount(Integer redeemedCount) {
		this.redeemedCount = redeemedCount;
	}

	public Integer getPerUserQuota() {
		return perUserQuota;
	}

	public void setPerUserQuota(Integer perUserQuota) {
		this.perUserQuota = perUserQuota;
	}

	public Boolean getStackable() {
		return stackable;
	}

	public void setStackable(Boolean stackable) {
		this.stackable = stackable;
	}

	public LocalDateTime getClaimStartAt() {
		return claimStartAt;
	}

	public void setClaimStartAt(LocalDateTime claimStartAt) {
		this.claimStartAt = claimStartAt;
	}

	public LocalDateTime getClaimEndAt() {
		return claimEndAt;
	}

	public void setClaimEndAt(LocalDateTime claimEndAt) {
		this.claimEndAt = claimEndAt;
	}

	public LocalDateTime getValidFrom() {
		return validFrom;
	}

	public void setValidFrom(LocalDateTime validFrom) {
		this.validFrom = validFrom;
	}

	public LocalDateTime getValidTo() {
		return validTo;
	}

	public void setValidTo(LocalDateTime validTo) {
		this.validTo = validTo;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Integer getPriority() {
		return priority;
	}

	public void setPriority(Integer priority) {
		this.priority = priority;
	}

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long createdBy) {
		this.createdBy = createdBy;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}