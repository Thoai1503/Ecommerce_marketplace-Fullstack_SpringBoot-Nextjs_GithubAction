package docker_test.com.models;

public class Brand {

	private Integer id;
	private String name;
	private String slug;
	private String logo;
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

	public String getLogo() {
		return logo;
	}

	public void setLogo(String logo) {
		this.logo = logo;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public Brand() {
	}

	public Brand(Integer id, String name, String slug, String logo, Integer status) {
		this.id = id;
		this.name = name;
		this.slug = slug;
		this.logo = logo;
		this.status = status;
	}
	
	
	
	
}