package docker_test.com.models.product;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class ProductAttribute {
	private int id;
	private int productId;
	private int attributeId;
	private Integer attributeValueId;
	private String valueText;
	private Double valueNumber;
	private LocalDate valueDate;
	private Integer unitId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public ProductAttribute() {
		this.createdAt = LocalDateTime.now();
	}

	public ProductAttribute(int id, int productId, int attributeId, Integer attributeValueId, String valueText,
			Double valueNumber, LocalDate valueDate, Integer unitId, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.productId = productId;
		this.attributeId = attributeId;
		this.attributeValueId = attributeValueId;
		this.valueText = valueText;
		this.valueNumber = valueNumber;
		this.valueDate = valueDate;
		this.unitId = unitId;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getProductId() {
		return productId;
	}

	public void setProductId(int productId) {
		this.productId = productId;
	}

	public int getAttributeId() {
		return attributeId;
	}

	public void setAttributeId(int attributeId) {
		this.attributeId = attributeId;
	}

	public Integer getAttributeValueId() {
		return attributeValueId;
	}

	public void setAttributeValueId(Integer attributeValueId) {
		this.attributeValueId = attributeValueId;
	}

	public String getValueText() {
		return valueText;
	}

	public void setValueText(String valueText) {
		this.valueText = valueText;
	}

	public Double getValueNumber() {
		return valueNumber;
	}

	public void setValueNumber(Double valueNumber) {
		this.valueNumber = valueNumber;
	}

	public LocalDate getValueDate() {
		return valueDate;
	}

	public void setValueDate(LocalDate valueDate) {
		this.valueDate = valueDate;
	}

	public Integer getUnitId() {
		return unitId;
	}

	public void setUnitId(Integer unitId) {
		this.unitId = unitId;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
