package docker_test.com.models.attribute;

import docker_test.com.models.Unit;

public final class AttributeValue {
	private int id;
	private int attribute_id;
	private Integer unit_id;
	private String value;

	public AttributeValue() {
	}

	public AttributeValue(int id, int attributeId, Integer unitId, String value) {
		this.id = id;
		this.attribute_id = attributeId;
		this.unit_id = unitId;
		this.value = value;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getAttribute_id() {
		return attribute_id;
	}

	public void setAttributeId(int attributeId) {
		this.attribute_id = attributeId;
	}

	public Integer getUnit_id() {
		return unit_id;
	}

	public void setUnit_id(Integer unitId) {
		this.unit_id = unitId;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
	public Unit unit;

	public Unit getUnit() {
		return unit;
	}

	public void setUnit(Unit unit) {
		this.unit = unit;
	}

	public void setAttribute_id(int attribute_id) {
		this.attribute_id = attribute_id;
	}
}