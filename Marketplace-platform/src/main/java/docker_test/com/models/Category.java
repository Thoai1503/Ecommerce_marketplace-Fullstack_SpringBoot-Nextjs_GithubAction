package docker_test.com.models;

import java.time.LocalDateTime;

public class Category {
	private long id;
	private long parentId;
	private String cateName;
	private String cateSlug;
	private String cateIcon;
	private long level;
	private boolean active;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getParentId() {
		return parentId;
	}

	public void setParentId(long parentId) {
		this.parentId = parentId;
	}

	public String getCateName() {
		return cateName;
	}

	public void setCateName(String cateName) {
		this.cateName = cateName;
	}

	public String getCateSlug() {
		return cateSlug;
	}

	public void setCateSlug(String cateSlug) {
		this.cateSlug = cateSlug;
	}

	public String getCateIcon() {
		return cateIcon;
	}

	public void setCateIcon(String cateIcon) {
		this.cateIcon = cateIcon;
	}

	public long getLevel() {
		return level;
	}

	public void setLevel(long level) {
		this.level = level;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
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

	public Category(long id, long parentId, String cateName, String cateSlug, String cateIcon, long level,
			boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.parentId = parentId;
		this.cateName = cateName;
		this.cateSlug = cateSlug;
		this.cateIcon = cateIcon;
		this.level = level;
		this.active = active;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

}
