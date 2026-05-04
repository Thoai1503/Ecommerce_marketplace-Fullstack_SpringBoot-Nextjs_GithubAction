package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetAdminPasswordRequest {
    @NotNull(message = "adminId khong duoc null")
    private Long adminId;
}
