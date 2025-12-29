package docker_test.com.models;

import docker_test.com.models.attribute.Attribute;

public final class CategoryAttribute {
	private int id;
	private int categoryId;
	private int attributeId;
	private int status;

	public CategoryAttribute() {
		this.status = 1;
	}

	public CategoryAttribute(int id, int categoryId, int attributeId, int status) {
		this.id = id;
		this.categoryId = categoryId;
		this.attributeId = attributeId;
		this.status = status;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public int getAttributeId() {
		return attributeId;
	}

	public void setAttributeId(int attributeId) {
		this.attributeId = attributeId;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	private Attribute attribute;

	public Attribute getAttribute() {
		return attribute;
	}

	public void setAttribute(Attribute attribute) {
		this.attribute = attribute;
	}
}

