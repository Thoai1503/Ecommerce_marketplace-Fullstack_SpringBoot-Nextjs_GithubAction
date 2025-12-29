package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductImage {
	private long imageId;
	private long productId;
	private String imageUrl;
	private int displayOrder;
	private boolean isThumbnail;
	private LocalDateTime createdAt;

	public ProductImage() {
		this.displayOrder = 0;
		this.isThumbnail = false;
		this.createdAt = LocalDateTime.now();
	}

	public ProductImage(long imageId, long productId, String imageUrl, int displayOrder, boolean isThumbnail,
			LocalDateTime createdAt) {
		this.imageId = imageId;
		this.productId = productId;
		this.imageUrl = imageUrl;
		this.displayOrder = displayOrder;
		this.isThumbnail = isThumbnail;
		this.createdAt = createdAt;
	}

	public long getImageId() {
		return imageId;
	}

	public void setImageId(long imageId) {
		this.imageId = imageId;
	}

	public long getProductId() {
		return productId;
	}

	public void setProductId(long productId) {
		this.productId = productId;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public int getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(int displayOrder) {
		this.displayOrder = displayOrder;
	}

	public boolean isThumbnail() {
		return isThumbnail;
	}

	public void setThumbnail(boolean thumbnail) {
		isThumbnail = thumbnail;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
