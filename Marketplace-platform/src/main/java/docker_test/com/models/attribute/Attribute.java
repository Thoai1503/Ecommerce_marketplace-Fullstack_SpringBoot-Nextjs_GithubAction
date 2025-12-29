package docker_test.com.models.attribute;

public final class Attribute {
	private int id;
	private String name;
	private String slug;
	private int dataType;
	private int status;

	public Attribute() {
		this.status = 1;
	}

	public Attribute(int id, String name, String slug, int dataType, int status) {
		this.id = id;
		this.name = name;
		this.slug = slug;
		this.dataType = dataType;
		this.status = status;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public int getDataType() {
		return dataType;
	}

	public void setDataType(int dataType) {
		this.dataType = dataType;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}
}
