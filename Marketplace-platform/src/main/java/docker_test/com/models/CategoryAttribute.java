package docker_test.com.models;

public class CategoryAttribute {
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Integer getCategory_id() {
		return category_id;
	}
	public void setCategory_id(Integer category_id) {
		this.category_id = category_id;
	}
	public Integer getAttribute_id() {
		return attribute_id;
	}
	public void setAttribute_id(Integer attribute_id) {
		this.attribute_id = attribute_id;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public CategoryAttribute(Integer id, Integer category_id, Integer attribute_id, Integer status) {
		super();
		this.id = id;
		this.category_id = category_id;
		this.attribute_id = attribute_id;
		this.status = status;
	}
	public CategoryAttribute() {}
	private Integer id;
  private Integer category_id;
  private Integer attribute_id;
  private Integer status;
  public Attribute getAttribute() {
	return attribute;
}
  public void setAttribute(Attribute attribute) {
	this.attribute = attribute;
  }
  private Attribute attribute;
  
}
