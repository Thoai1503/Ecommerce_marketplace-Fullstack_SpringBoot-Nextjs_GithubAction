package docker_test.com.models.attribute;

public class Attribute {
	private Integer id;
	private String name;
	private String slug;
	private Integer status;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
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

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public Attribute() {
		this.status = 1;
	}

	public Attribute(Integer id, String name, String slug, Integer status) {
		this.id = id;
		this.name = name;
		this.slug = slug;
		this.status = status;
	}
}