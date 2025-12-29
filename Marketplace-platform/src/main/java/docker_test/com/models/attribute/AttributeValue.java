package docker_test.com.models.attribute;

public final class AttributeValue {
	private int id;
	private int attributeId;
	private Integer unitId;
	private String value;

	public AttributeValue() {
	}

	public AttributeValue(int id, int attributeId, Integer unitId, String value) {
		this.id = id;
		this.attributeId = attributeId;
		this.unitId = unitId;
		this.value = value;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getAttributeId() {
		return attributeId;
	}

	public void setAttributeId(int attributeId) {
		this.attributeId = attributeId;
	}

	public Integer getUnitId() {
		return unitId;
	}

	public void setUnitId(Integer unitId) {
		this.unitId = unitId;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}