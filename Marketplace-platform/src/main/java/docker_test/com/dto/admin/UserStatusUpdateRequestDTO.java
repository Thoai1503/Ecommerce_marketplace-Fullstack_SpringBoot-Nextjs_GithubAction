package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UserStatusUpdateRequestDTO {
    @NotBlank(message = "Trạng thái là bắt buộc")
    @Pattern(regexp = "^(ACTIVE|BLOCKED)$", message = "Trạng thái chỉ được là ACTIVE hoặc BLOCKED")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
