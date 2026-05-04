package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UserRoleUpdateRequestDTO {
    @NotBlank(message = "Vai trò là bắt buộc")
    @Pattern(regexp = "^(USER|SELLER)$", message = "Chỉ được đổi giữa USER và SELLER tại mục Phân quyền")
    private String role;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
