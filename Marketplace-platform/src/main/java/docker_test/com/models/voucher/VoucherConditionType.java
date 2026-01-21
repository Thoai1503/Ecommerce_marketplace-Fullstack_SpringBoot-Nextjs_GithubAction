package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public final class VoucherConditionType {
    private int typeId;
    private String typeName;
    private String description;
    private String code; // Ví dụ: MIN_ORDER, CATEGORY_LIMIT, USER_AGE
    private LocalDateTime createdAt;

    public VoucherConditionType() {
        this.createdAt = LocalDateTime.now();
    }

    public VoucherConditionType(int typeId, String typeName, String description, String code, LocalDateTime createdAt) {
        this.typeId = typeId;
        this.typeName = typeName;
        this.description = description;
        this.code = code;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public int getTypeId() { return typeId; }
    public void setTypeId(int typeId) { this.typeId = typeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}