package docker_test.com.models;

public class CategoryBrand {

	private Integer id;
	private int category_id;
	private int brand_id;
	private Integer status;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public int getCategory_id() {
		return category_id;
	}

	public void setCategory_id(int category_id) {
		this.category_id = category_id;
	}

	public int getBrand_id() {
		return brand_id;
	}

	public void setBrand_id(int brand_id) {
		this.brand_id = brand_id;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public CategoryBrand() {
	}

	public CategoryBrand(Integer id, int category_id, int brand_id, Integer status) {
		this.id = id;
		this.category_id = category_id;
		this.brand_id = brand_id;
		this.status = status;
	}
	
	

}
