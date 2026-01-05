package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public final class VoucherCondition {
    private long conditionId;
    private long voucherId;
    private int conditionTypeId;
    private String operator;
    private Double valueNumeric;
    private Double valueNumericMax;
    private String valueText;
    private String valueJson;
    private boolean isRequired;
    private int priority;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VoucherCondition() {
        this.isRequired = true;
        this.priority = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public VoucherCondition(long conditionId, long voucherId, int conditionTypeId, String operator,
                            Double valueNumeric, Double valueNumericMax, String valueText,
                            String valueJson, boolean isRequired, int priority, String errorMessage,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.conditionId = conditionId;
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

    // Getters and Setters
    public long getConditionId() { return conditionId; }
    public void setConditionId(long conditionId) { this.conditionId = conditionId; }
    public long getVoucherId() { return voucherId; }
    public void setVoucherId(long voucherId) { this.voucherId = voucherId; }
    public int getConditionTypeId() { return conditionTypeId; }
    public void setConditionTypeId(int conditionTypeId) { this.conditionTypeId = conditionTypeId; }
    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public Double getValueNumeric() {
        return valueNumeric;
    }

    public void setValueNumeric(Double valueNumeric) {
        this.valueNumeric = valueNumeric;
    }

    public Double getValueNumericMax() {
        return valueNumericMax;
    }

    public void setValueNumericMax(Double valueNumericMax) {
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

    // Đối với kiểu boolean, Getter thường đặt là 'is...' thay vì 'get...'
    public boolean isRequired() {
        return isRequired;
    }

    public void setRequired(boolean required) {
        isRequired = required;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
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
    
    // Override toString để dễ dàng debug (in ra log)
    @Override
    public String toString() {
        return "VoucherCondition{" +
                "conditionId=" + conditionId +
                ", voucherId=" + voucherId +
                ", conditionTypeId=" + conditionTypeId +
                ", operator='" + operator + '\'' +
                ", valueNumeric=" + valueNumeric +
                ", valueNumericMax=" + valueNumericMax +
                ", isRequired=" + isRequired +
                '}';
    }
}

