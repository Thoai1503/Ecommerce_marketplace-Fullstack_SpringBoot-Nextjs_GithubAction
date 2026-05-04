package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StatusChangeRequestDTO {
    @NotBlank(message = "status là bắt buộc")
    @Pattern(
            regexp = "^(PENDING|APPROVED|REJECTED|DRAFT|HIDDEN|ACTIVE)$",
            message = "Trạng thái không hợp lệ"
    )
    private String status;

    @Size(max = 1000, message = "Reason tối đa 1000 ký tự")
    private String reason;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
