package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductReview {
	private long reviewId;
	private long productId;
	private long userId;
	private long orderId;
	private int rating;
	private String comment;
	private int isAnonymous;
	private String shopReply;
	private LocalDateTime shopRepliedAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public ProductReview() {
		this.isAnonymous = 0;
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	public ProductReview(long reviewId, long productId, long userId, long orderId, int rating, String comment,
			int isAnonymous, String shopReply, LocalDateTime shopRepliedAt, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
		this.reviewId = reviewId;
		this.productId = productId;
		this.userId = userId;
		this.orderId = orderId;
		this.rating = rating;
		this.comment = comment;
		this.isAnonymous = isAnonymous;
		this.shopReply = shopReply;
		this.shopRepliedAt = shopRepliedAt;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public long getReviewId() {
		return reviewId;
	}

	public void setReviewId(long reviewId) {
		this.reviewId = reviewId;
	}

	public long getProductId() {
		return productId;
	}

	public void setProductId(long productId) {
		this.productId = productId;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public long getOrderId() {
		return orderId;
	}

	public void setOrderId(long orderId) {
		this.orderId = orderId;
	}

	public int getRating() {
		return rating;
	}

	public void setRating(int rating) {
		this.rating = rating;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public int isAnonymous() {
		return isAnonymous;
	}

	public void setAnonymous(int anonymous) {
		isAnonymous = anonymous;
	}

	public String getShopReply() {
		return shopReply;
	}

	public void setShopReply(String shopReply) {
		this.shopReply = shopReply;
	}

	public LocalDateTime getShopRepliedAt() {
		return shopRepliedAt;
	}

	public void setShopRepliedAt(LocalDateTime shopRepliedAt) {
		this.shopRepliedAt = shopRepliedAt;
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