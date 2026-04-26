package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public class UserVoucher {

	private Long id;
	private Long userId;
	private Long voucherId;

	private String claimChannel;
	private LocalDateTime claimedAt;

	private String status;

	private Long reservedOrderId;
	private LocalDateTime reservedAt;

	private LocalDateTime expiredAt;
	private LocalDateTime redeemedAt;

	public UserVoucher() {
	}

	// ===== Getter / Setter =====

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getVoucherId() {
		return voucherId;
	}

	public void setVoucherId(Long voucherId) {
		this.voucherId = voucherId;
	}

	public String getClaimChannel() {
		return claimChannel;
	}

	public void setClaimChannel(String claimChannel) {
		this.claimChannel = claimChannel;
	}

	public LocalDateTime getClaimedAt() {
		return claimedAt;
	}

	public void setClaimedAt(LocalDateTime claimedAt) {
		this.claimedAt = claimedAt;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getReservedOrderId() {
		return reservedOrderId;
	}

	public void setReservedOrderId(Long reservedOrderId) {
		this.reservedOrderId = reservedOrderId;
	}

	public LocalDateTime getReservedAt() {
		return reservedAt;
	}

	public void setReservedAt(LocalDateTime reservedAt) {
		this.reservedAt = reservedAt;
	}

	public LocalDateTime getExpiredAt() {
		return expiredAt;
	}

	public void setExpiredAt(LocalDateTime expiredAt) {
		this.expiredAt = expiredAt;
	}

	public LocalDateTime getRedeemedAt() {
		return redeemedAt;
	}

	public void setRedeemedAt(LocalDateTime redeemedAt) {
		this.redeemedAt = redeemedAt;
	}
}