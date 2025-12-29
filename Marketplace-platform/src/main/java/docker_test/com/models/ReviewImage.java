package docker_test.com.models;

import java.time.LocalDateTime;

public final class ReviewImage {
	private long reviewImageId;
	private long reviewId;
	private String imageUrl;
	private LocalDateTime createdAt;

	public ReviewImage() {
		this.createdAt = LocalDateTime.now();
	}

	public ReviewImage(long reviewImageId, long reviewId, String imageUrl, LocalDateTime createdAt) {
		this.reviewImageId = reviewImageId;
		this.reviewId = reviewId;
		this.imageUrl = imageUrl;
		this.createdAt = createdAt;
	}

	public long getReviewImageId() {
		return reviewImageId;
	}

	public void setReviewImageId(long reviewImageId) {
		this.reviewImageId = reviewImageId;
	}

	public long getReviewId() {
		return reviewId;
	}

	public void setReviewId(long reviewId) {
		this.reviewId = reviewId;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
