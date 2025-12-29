package docker_test.com.models.attribute;

public final class AttributeUnit {
	private int id;
	private int attributeId;
	private int unitId;
	private int status;

	public AttributeUnit() {
		this.status = 1;
	}

	public AttributeUnit(int id, int attributeId, int unitId, int status) {
		this.id = id;
		this.attributeId = attributeId;
		this.unitId = unitId;
		this.status = status;
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

	public int getUnitId() {
		return unitId;
	}

	public void setUnitId(int unitId) {
		this.unitId = unitId;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}
}
