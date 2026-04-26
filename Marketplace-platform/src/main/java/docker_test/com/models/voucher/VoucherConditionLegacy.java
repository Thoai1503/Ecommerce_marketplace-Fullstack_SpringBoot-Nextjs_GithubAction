package docker_test.com.models.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VoucherConditionLegacy {

	private Long id;
	private Long voucherId;
	private Integer conditionTypeId;
	private String operator;

	private BigDecimal valueNumeric;
	private BigDecimal valueNumericMax;
	private String valueText;
	private String valueJson;

	private Boolean isRequired;
	private Integer priority;
	private String errorMessage;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public VoucherConditionLegacy() {
	}

	public VoucherConditionLegacy(Long id, Long voucherId, Integer conditionTypeId, String operator,
			BigDecimal valueNumeric, BigDecimal valueNumericMax, String valueText, String valueJson, Boolean isRequired,
			Integer priority, String errorMessage, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.voucherId = voucherId;
		this.conditionTypeId = conditionTypeId;
		this.operator = operator;
		this.valueNumeric = valueNumeric;
		this.valueNumericMax = valueNumericMax;
		this.valueText = valueText;
		this.valueJson = valueJson;
		this.isRequired = isRequired;
		this.priority = priority;
		this.errorMessage = errorMessage;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	// ===== Getter / Setter =====

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVoucherId() {
		return voucherId;
	}

	public void setVoucherId(Long voucherId) {
		this.voucherId = voucherId;
	}

	public Integer getConditionTypeId() {
		return conditionTypeId;
	}

	public void setConditionTypeId(Integer conditionTypeId) {
		this.conditionTypeId = conditionTypeId;
	}

	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	public BigDecimal getValueNumeric() {
		return valueNumeric;
	}

	public void setValueNumeric(BigDecimal valueNumeric) {
		this.valueNumeric = valueNumeric;
	}

	public BigDecimal getValueNumericMax() {
		return valueNumericMax;
	}

	public void setValueNumericMax(BigDecimal valueNumericMax) {
		this.valueNumericMax = valueNumericMax;
	}

	public String getValueText() {
		return valueText;
	}

	public void setValueText(String valueText) {
		this.valueText = valueText;
	}

	public String getValueJson() {
		return valueJson;
	}

	public void setValueJson(String valueJson) {
		this.valueJson = valueJson;
	}

	public Boolean getIsRequired() {
		return isRequired;
	}

	public void setIsRequired(Boolean isRequired) {
		this.isRequired = isRequired;
	}

	public Integer getPriority() {
		return priority;
	}

	public void setPriority(Integer priority) {
		this.priority = priority;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
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