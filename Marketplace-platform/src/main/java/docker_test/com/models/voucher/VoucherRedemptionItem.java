package docker_test.com.models.voucher;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;

public class VoucherRedemptionItem {

	private Long id;
	@JsonAlias("voucher_redemption_id")
	private Long voucherRedemptionId;
	@JsonAlias("order_item_id")
	private Long orderItemId;
	@JsonAlias("discount_amount")
	private BigDecimal discountAmount;

	public VoucherRedemptionItem() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVoucherRedemptionId() {
		return voucherRedemptionId;
	}

	public void setVoucherRedemptionId(Long voucherRedemptionId) {
		this.voucherRedemptionId = voucherRedemptionId;
	}

	public Long getOrderItemId() {
		return orderItemId;
	}

	public void setOrderItemId(Long orderItemId) {
		this.orderItemId = orderItemId;
	}

	public BigDecimal getDiscountAmount() {
		return discountAmount;
	}

	public void setDiscountAmount(BigDecimal discountAmount) {
		this.discountAmount = discountAmount;
	}
}
