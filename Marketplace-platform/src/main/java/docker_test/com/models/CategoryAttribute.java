package docker_test.com.models;

public class CategoryAttribute {
	private int id;
	private long categoryId;
	private int attributeId;
	private int status;

	public CategoryAttribute() {
	}

	public CategoryAttribute(int id, long categoryId, int attributeId, int status) {
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

	public long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(long categoryId) {
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
}