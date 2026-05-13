package docker_test.com.models.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VoucherRedemption {

	private Long id;
	private Long userVoucherId;
	private Long voucherId;
	private Long userId;

	private Long orderId;
	private String orderCode;

	private BigDecimal originalShippingFee;
	private BigDecimal originalOrderAmount;
	private BigDecimal discountAmountApplied;
	private BigDecimal finalOrderAmount;

	private LocalDateTime redeemedAt;
	private String status;
	private String failureReason;

	public VoucherRedemption() {
	}

	// ===== Getter / Setter =====
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUserVoucherId() {
		return userVoucherId;
	}

	public void setUserVoucherId(Long userVoucherId) {
		this.userVoucherId = userVoucherId;
	}

	public Long getVoucherId() {
		return voucherId;
	}

	public void setVoucherId(Long voucherId) {
		this.voucherId = voucherId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public String getOrderCode() {
		return orderCode;
	}

	public void setOrderCode(String orderCode) {
		this.orderCode = orderCode;
	}

	public BigDecimal getOriginalShippingFee() {
		return originalShippingFee;
	}

	public void setOriginalShippingFee(BigDecimal originalShippingFee) {
		this.originalShippingFee = originalShippingFee;
	}

	public BigDecimal getOriginalOrderAmount() {
		return originalOrderAmount;
	}

	public void setOriginalOrderAmount(BigDecimal originalOrderAmount) {
		this.originalOrderAmount = originalOrderAmount;
	}

	public BigDecimal getDiscountAmountApplied() {
		return discountAmountApplied;
	}

	public void setDiscountAmountApplied(BigDecimal discountAmountApplied) {
		this.discountAmountApplied = discountAmountApplied;
	}

	public BigDecimal getFinalOrderAmount() {
		return finalOrderAmount;
	}

	public void setFinalOrderAmount(BigDecimal finalOrderAmount) {
		this.finalOrderAmount = finalOrderAmount;
	}

	public LocalDateTime getRedeemedAt() {
		return redeemedAt;
	}

	public void setRedeemedAt(LocalDateTime redeemedAt) {
		this.redeemedAt = redeemedAt;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getFailureReason() {
		return failureReason;
	}

	public void setFailureReason(String failureReason) {
		this.failureReason = failureReason;
	}
}