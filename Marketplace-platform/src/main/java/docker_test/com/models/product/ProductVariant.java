package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductVariant {
	private long variantId;
	private long productId;
	private String variantName;
	private String sku;
	private Double price;
	private int stockQuantity;
	private String imageUrl;
	private int isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public ProductVariant() {
		this.stockQuantity = 0;
		this.isActive = 1;
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	public ProductVariant(long variantId, long productId, String variantName, String sku, Double price,
			int stockQuantity, String imageUrl, int isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.variantId = variantId;
		this.productId = productId;
		this.variantName = variantName;
		this.sku = sku;
		this.price = price;
		this.stockQuantity = stockQuantity;
		this.imageUrl = imageUrl;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public long getVariantId() {
		return variantId;
	}

	public void setVariantId(long variantId) {
		this.variantId = variantId;
	}

	public long getProductId() {
		return productId;
	}

	public void setProductId(long productId) {
		this.productId = productId;
	}

	public String getVariantName() {
		return variantName;
	}

	public void setVariantName(String variantName) {
		this.variantName = variantName;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public int getStockQuantity() {
		return stockQuantity;
	}

	public void setStockQuantity(int stockQuantity) {
		this.stockQuantity = stockQuantity;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public int isActive() {
		return isActive;
	}

	public void setActive(int active) {
		isActive = active;
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
