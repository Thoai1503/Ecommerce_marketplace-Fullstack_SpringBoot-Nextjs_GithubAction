package docker_test.com.models.attribute;

public final class AttributeUnit {
    
    private int id;
    private int attribute_id;
    private int unit_id;
    private int status;

    public AttributeUnit() {
        this.status = 1;
    }

    public AttributeUnit(int id, int attributeId, int unitId, int status) {
        this.id = id;
        this.attribute_id = attributeId;
        this.unit_id = unitId;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAttributeId() {
        return attribute_id;
    }

    public void setAttributeId(int attributeId) {
        this.attribute_id = attributeId;
    }

    public int getUnitId() {
        return unit_id;
    }

    public void setUnitId(int unitId) {
        this.unit_id = unitId;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}