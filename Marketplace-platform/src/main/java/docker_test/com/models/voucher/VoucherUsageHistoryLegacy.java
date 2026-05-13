package docker_test.com.models.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VoucherUsageHistoryLegacy {

	private Long id;
	private Long voucherId;
	private Long userId;
	private Long orderId;
	private Long orderShipmentId;
	private BigDecimal discountAmount;
	private LocalDateTime usedAt;

	public VoucherUsageHistoryLegacy() {
	}

	public VoucherUsageHistoryLegacy(Long id, Long voucherId, Long userId, Long orderId, BigDecimal discountAmount,
			LocalDateTime usedAt) {
		this.id = id;
		this.voucherId = voucherId;
		this.userId = userId;
		this.orderId = orderId;
		this.discountAmount = discountAmount;
		this.usedAt = usedAt;
	}

	public VoucherUsageHistoryLegacy(Long id, Long voucherId, Long userId, Long orderId, Long orderShipmentId,
			BigDecimal discountAmount, LocalDateTime usedAt) {
		this.id = id;
		this.voucherId = voucherId;
		this.userId = userId;
		this.orderId = orderId;
		this.orderShipmentId = orderShipmentId;
		this.discountAmount = discountAmount;
		this.usedAt = usedAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Long getOrderShipmentId() {
		return orderShipmentId;
	}

	public void setOrderShipmentId(Long orderShipmentId) {
		this.orderShipmentId = orderShipmentId;
	}

	public BigDecimal getDiscountAmount() {
		return discountAmount;
	}

	public void setDiscountAmount(BigDecimal discountAmount) {
		this.discountAmount = discountAmount;
	}

	public LocalDateTime getUsedAt() {
		return usedAt;
	}

	public void setUsedAt(LocalDateTime usedAt) {
		this.usedAt = usedAt;
	}
}
