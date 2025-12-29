package docker_test.com.models;

import java.time.LocalDateTime;

public final class Category {
	private long id;
	private Long parentId;
	private String categoryName;
	private String categorySlug;
	private String categoryIcon;
	private int level;
	private int isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public Category() {
		this.level = 0;
		this.isActive = 1;
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	public Category(long id, Long parentId, String categoryName, String categorySlug, String categoryIcon, int level,
			int isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.parentId = parentId;
		this.categoryName = categoryName;
		this.categorySlug = categorySlug;
		this.categoryIcon = categoryIcon;
		this.level = level;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Long getParentId() {
		return parentId;
	}

	public void setParentId(Long parentId) {
		this.parentId = parentId;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public String getCategorySlug() {
		return categorySlug;
	}

	public void setCategorySlug(String categorySlug) {
		this.categorySlug = categorySlug;
	}

	public String getCategoryIcon() {
		return categoryIcon;
	}

	public void setCategoryIcon(String categoryIcon) {
		this.categoryIcon = categoryIcon;
	}

	public int getLevel() {
		return level;
	}

	public void setLevel(int level) {
		this.level = level;
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