package docker_test.com.models.attribute;

public final class AttributeUnit {

	private Integer id; // AUTO_INCREMENT
	private int attribute_id;
	private int unit_id;
	private int status;

	public AttributeUnit() {
		this.status = 1;
	}

	public AttributeUnit(Integer id, int attribute_id, int unit_id, int status) {
		this.id = id;
		this.attribute_id = attribute_id;
		this.unit_id = unit_id;
		this.status = status;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public int getAttribute_id() {
		return attribute_id;
	}

	public void setAttribute_id(int attribute_id) {
		this.attribute_id = attribute_id;
	}

	public int getUnit_id() {
		return unit_id;
	}

	public void setUnit_id(int unit_id) {
		this.unit_id = unit_id;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}
}