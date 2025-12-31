package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductImage {
	private long imageId;
	private long productId;
	private String imageUrl;
	private int displayOrder;
	private int isThumbnail;
	private LocalDateTime createdAt;

	public ProductImage() {
		this.displayOrder = 0;
		this.isThumbnail = 0;
		this.createdAt = LocalDateTime.now();
	}

	public ProductImage(long imageId, long productId, String imageUrl, int displayOrder, int isThumbnail,
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

	public int isThumbnail() {
		return isThumbnail;
	}

	public void setThumbnail(int thumbnail) {
		isThumbnail = thumbnail;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
