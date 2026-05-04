package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectRequestDTO {
    @NotBlank(message = "Lý do là bắt buộc")
    @Size(min = 5, max = 1000, message = "Lý do phải từ 5-1000 ký tự")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
