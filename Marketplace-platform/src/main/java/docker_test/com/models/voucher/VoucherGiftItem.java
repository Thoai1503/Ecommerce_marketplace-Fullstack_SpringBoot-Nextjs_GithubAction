package docker_test.com.models.voucher;

public class VoucherGiftItem {

	private Long id;
	private Long voucherId;
	private Long productId;
	private Long variantId;
	private Integer quantity;

	public VoucherGiftItem() {
	}

	public VoucherGiftItem(Long id, Long voucherId, Long productId, Long variantId, Integer quantity) {
		this.id = id;
		this.voucherId = voucherId;
		this.productId = productId;
		this.variantId = variantId;
		this.quantity = quantity;
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

	public Long getProductId() {
		return productId;
	}

	public void setProductId(Long productId) {
		this.productId = productId;
	}

	public Long getVariantId() {
		return variantId;
	}

	public void setVariantId(Long variantId) {
		this.variantId = variantId;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
}