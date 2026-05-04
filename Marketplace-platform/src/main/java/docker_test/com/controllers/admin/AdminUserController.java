package docker_test.com.controllers.admin;

import docker_test.com.dto.admin.UserPermissionDTO;
import docker_test.com.dto.admin.UserRoleUpdateRequestDTO;
import docker_test.com.dto.admin.UserStatusUpdateRequestDTO;
import docker_test.com.models.User;
import docker_test.com.repository.PasswordResetTokenRepository;
import docker_test.com.repository.RefreshSessionRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.AuditService;
import docker_test.com.services.EmailService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RefreshSessionRepository refreshSessionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final AuditService auditService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public AdminUserController(UserRepository userRepository,
                               RefreshSessionRepository refreshSessionRepository,
                               PasswordResetTokenRepository passwordResetTokenRepository,
                               EmailService emailService,
                               AuditService auditService) {
        this.userRepository = userRepository;
        this.refreshSessionRepository = refreshSessionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<UserPermissionDTO>> listUsers() {
        List<UserPermissionDTO> users = userRepository.findPermissionUsers()
                .stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id,
                                        @Valid @RequestBody UserRoleUpdateRequestDTO request) {
        User target = userRepository.findById(id);
        if (target == null) {
            return error(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng");
        }
        if (!isPermissionManagedUser(target)) {
            return error(HttpStatus.FORBIDDEN, "ADMIN_ROLE_MANAGED_SEPARATELY",
                    "Tài khoản Admin chỉ được quản lý tại mục Quản lý Admin");
        }

        String fromRole = normalizeRole(target.getRole());
        String toRole = request.getRole().trim().toUpperCase();
        if (fromRole.equals(toRole)) {
            return ResponseEntity.ok(toDto(target));
        }

        boolean updated = userRepository.updateRole(id, toRole);
        if (!updated) {
            return error(HttpStatus.BAD_REQUEST, "UPDATE_ROLE_FAILED", "Không thể cập nhật vai trò người dùng");
        }

        User updatedUser = userRepository.findById(id);
        auditService.logAction(
                currentUserId(),
                currentRole(),
                "CHANGE_USER_ROLE",
                "USER",
                id,
                String.format("{\"fromRole\":\"%s\",\"toRole\":\"%s\",\"targetEmail\":\"%s\"}",
                        fromRole, toRole, safeJson(target.getEmail()))
        );
        return ResponseEntity.ok(toDto(updatedUser));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        User target = userRepository.findById(id);
        if (target == null) {
            return error(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng");
        }
        if (!isPermissionManagedUser(target)) {
            return error(HttpStatus.FORBIDDEN, "ADMIN_PASSWORD_MANAGED_SEPARATELY",
                    "Mật khẩu Admin chỉ được cấp lại tại mục Quản lý Admin");
        }

        try {
            passwordResetTokenRepository.invalidateExistingForUser(id, "SET_PASSWORD");
            String resetToken = passwordResetTokenRepository.createForUser(id, "SET_PASSWORD", 24);
            String resetLink = frontendUrl + "/set-password?token=" + resetToken;
            String role = normalizeRole(target.getRole());

            emailService.send(
                    target.getEmail(),
                    "Cấp lại mật khẩu - VietCommerce Hub",
                    buildPasswordResetEmail(target.getFullName(), resetLink)
            );

            auditService.logAction(
                    currentUserId(),
                    currentRole(),
                    "SELLER".equals(role) ? "RESET_SELLER_PASSWORD" : "RESET_USER_PASSWORD",
                    "USER",
                    id,
                    String.format("{\"targetUserId\":%d,\"targetEmail\":\"%s\",\"targetRole\":\"%s\",\"resetTokenSent\":true}",
                            id, safeJson(target.getEmail()), role)
            );

            return ResponseEntity.ok(Map.of("message", "Đã gửi email cấp lại mật khẩu"));
        } catch (Exception e) {
            return error(HttpStatus.BAD_REQUEST, "RESET_PASSWORD_FAILED",
                    "Không thể gửi email cấp lại mật khẩu: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @Valid @RequestBody UserStatusUpdateRequestDTO request) {
        User target = userRepository.findById(id);
        if (target == null) {
            return error(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng");
        }
        if (!isPermissionManagedUser(target)) {
            return error(HttpStatus.FORBIDDEN, "ADMIN_STATUS_MANAGED_SEPARATELY",
                    "Tài khoản Admin chỉ được quản lý tại mục Quản lý Admin");
        }

        String status = request.getStatus().trim().toUpperCase();
        int activeValue = "ACTIVE".equals(status) ? 1 : 0;
        boolean updated = userRepository.updateActiveStatus(id, activeValue);
        if (!updated) {
            return error(HttpStatus.BAD_REQUEST, "UPDATE_STATUS_FAILED", "Không thể cập nhật trạng thái người dùng");
        }

        int revokedSessions = 0;
        if ("BLOCKED".equals(status)) {
            revokedSessions = refreshSessionRepository.revokeAllByUserId(id);
        }

        User updatedUser = userRepository.findById(id);
        auditService.logAction(
                currentUserId(),
                currentRole(),
                "ACTIVE".equals(status) ? "UNBLOCK_USER" : "BLOCK_USER",
                "USER",
                id,
                String.format("{\"status\":\"%s\",\"revokedSessions\":%d,\"targetEmail\":\"%s\"}",
                        status, revokedSessions, safeJson(target.getEmail()))
        );
        return ResponseEntity.ok(toDto(updatedUser));
    }

    private UserPermissionDTO toDto(User user) {
        return new UserPermissionDTO(
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getFullName(),
                normalizeRole(user.getRole()),
                user.getIsActive() != null && user.getIsActive() == 1 ? "ACTIVE" : "BLOCKED",
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    private boolean isPermissionManagedUser(User user) {
        String role = normalizeRole(user.getRole());
        return "USER".equals(role) || "SELLER".equals(role);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank() || "CUSTOMER".equalsIgnoreCase(role)) {
            return "USER";
        }
        return role.trim().toUpperCase();
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long id) {
            return id;
        }
        return null;
    }

    private String currentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return "ADMIN";
        }
        return auth.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElse("ADMIN");
    }

    private String safeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String buildPasswordResetEmail(String name, String link) {
        String safeName = name == null || name.isBlank() ? "bạn" : name;
        return """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#334155">
                  <h2 style="color:#1e40af">VietCommerce Hub - Cấp lại mật khẩu</h2>
                  <p>Xin chào <strong>%s</strong>,</p>
                  <p>Quản trị viên đã tạo yêu cầu cấp lại mật khẩu cho tài khoản của bạn.</p>
                  <p><a href="%s" style="display:inline-block;background:#2563eb;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Đặt lại mật khẩu</a></p>
                  <p style="font-size:12px;color:#64748b">Link này có hiệu lực trong thời gian ngắn và chỉ dùng được một lần.</p>
                </div>
                """.formatted(safeName, link);
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "error", code,
                "message", message
        ));
    }
}
