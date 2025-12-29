package docker_test.com.models;

import java.time.LocalDateTime;

public final class Cart {
	private long cartId;
	private long userId;
	private long productId;
	private Long variantId;
	private int quantity;
	private LocalDateTime addedAt;
	private LocalDateTime updatedAt;

	public Cart() {
		this.quantity = 0;
		this.addedAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	public Cart(long cartId, long userId, long productId, Long variantId, int quantity, LocalDateTime addedAt,
			LocalDateTime updatedAt) {
		this.cartId = cartId;
		this.userId = userId;
		this.productId = productId;
		this.variantId = variantId;
		this.quantity = quantity;
		this.addedAt = addedAt;
		this.updatedAt = updatedAt;
	}

	public long getCartId() {
		return cartId;
	}

	public void setCartId(long cartId) {
		this.cartId = cartId;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public long getProductId() {
		return productId;
	}

	public void setProductId(long productId) {
		this.productId = productId;
	}

	public Long getVariantId() {
		return variantId;
	}

	public void setVariantId(Long variantId) {
		this.variantId = variantId;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public LocalDateTime getAddedAt() {
		return addedAt;
	}

	public void setAddedAt(LocalDateTime addedAt) {
		this.addedAt = addedAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
