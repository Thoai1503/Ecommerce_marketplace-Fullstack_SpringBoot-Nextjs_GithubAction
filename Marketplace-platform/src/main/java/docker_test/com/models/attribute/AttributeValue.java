package docker_test.com.models.attribute;

public class AttributeValue {

	private Integer id;
	private int attribute_id;
	private Integer unit_id; // 🔥 cho phép null
	private String value;

	public AttributeValue() {
	}

	public AttributeValue(Integer id, int attribute_id, Integer unit_id, String value) {
		this.id = id;
		this.attribute_id = attribute_id;
		this.unit_id = unit_id;
		this.value = value;
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

	public Integer getUnit_id() {
		return unit_id;
	}

	public void setUnit_id(Integer unit_id) {
		this.unit_id = unit_id;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}