package docker_test.com.dto.admin;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminRoleDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String roleName;
    private LocalDateTime createdAt;
    private Long createdBy;
    private String createdByName;
    private Boolean isActive;
    private Boolean accountActive;
    private LocalDateTime lastLogin;

    public AdminRoleDTO(Long id, Long userId, String roleName, LocalDateTime createdAt, Long createdBy, Boolean isActive) {
        this.id = id;
        this.userId = userId;
        this.roleName = roleName;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.isActive = isActive;
    }
}
