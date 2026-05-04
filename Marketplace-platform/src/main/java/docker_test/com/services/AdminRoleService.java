package docker_test.com.services;

import docker_test.com.dto.admin.AdminRoleDTO;
import docker_test.com.models.AdminRole;
import docker_test.com.models.User;
import docker_test.com.repository.AdminRoleRepository;
import docker_test.com.repository.PasswordResetTokenRepository;
import docker_test.com.repository.RefreshSessionRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminRoleService {

    private final AdminRoleRepository adminRoleRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final EmailService emailService;
    private final RefreshSessionRepository refreshSessionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public AdminRoleService(AdminRoleRepository adminRoleRepository,
                            UserRepository userRepository,
                            AuditService auditService,
                            EmailService emailService,
                            RefreshSessionRepository refreshSessionRepository,
                            PasswordResetTokenRepository passwordResetTokenRepository) {
        this.adminRoleRepository = adminRoleRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.emailService = emailService;
        this.refreshSessionRepository = refreshSessionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    public AdminRoleDTO createAdminAccount(Long superAdminId, String email, String fullName, String phone) throws Exception {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new RuntimeException("Email la bat buoc");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email da ton tai. Hay dung chuc nang Cap quyen Admin cho user co san.");
        }

        String temporaryHash = PasswordUtil.hash(UUID.randomUUID().toString());
        User createdUser = userRepository.createAdminUser(
                normalizedEmail,
                fullName != null ? fullName.trim() : null,
                phone != null ? phone.trim() : null,
                temporaryHash
        );
        if (createdUser == null) {
            throw new RuntimeException("Tao tai khoan Admin that bai");
        }

        AdminRole adminRole = new AdminRole();
        adminRole.setUserId(createdUser.getId());
        adminRole.setRoleName("ADMIN");
        adminRole.setCreatedBy(superAdminId);
        adminRole.setCreatedAt(LocalDateTime.now());
        adminRole.setIsActive(true);
        AdminRole saved = adminRoleRepository.save(adminRole);

        auditService.logAction(
                superAdminId,
                "SUPER_ADMIN",
                "CREATE_ADMIN_ACCOUNT",
                "ADMIN",
                saved.getId(),
                String.format("{\"targetUserId\":%d,\"email\":\"%s\"}", createdUser.getId(), safeJson(normalizedEmail))
        );

        sendAdminSetupEmail(createdUser);
        return toDTOWithUserDetails(saved);
    }

    public AdminRoleDTO grantAdminRole(Long superAdminId, Long targetUserId, String roleName) throws Exception {
        User targetUser = userRepository.findById(targetUserId);
        if (targetUser == null) {
            throw new RuntimeException("User not found");
        }
        if (!"ADMIN".equals(roleName) && !"SUPER_ADMIN".equals(roleName)) {
            throw new RuntimeException("Role khong hop le");
        }
        AdminRole existing = adminRoleRepository.findByUserId(targetUserId);
        if (existing != null && Boolean.TRUE.equals(existing.getIsActive()) && roleName.equals(existing.getRoleName())) {
            throw new RuntimeException("User already has this role");
        }

        AdminRole adminRole = existing != null ? existing : new AdminRole();
        adminRole.setUserId(targetUserId);
        adminRole.setRoleName(roleName);
        adminRole.setCreatedBy(superAdminId);
        adminRole.setCreatedAt(adminRole.getCreatedAt() != null ? adminRole.getCreatedAt() : LocalDateTime.now());
        adminRole.setIsActive(true);

        AdminRole saved = adminRoleRepository.save(adminRole);
        if (!userRepository.updateRole(targetUserId, roleName)) {
            throw new RuntimeException("Cap nhat role nguoi dung that bai");
        }

        auditService.logAction(
                superAdminId,
                "SUPER_ADMIN",
                "GRANT_ADMIN_ROLE",
                "ADMIN",
                saved.getId(),
                String.format("{\"targetUserId\":%d,\"roleName\":\"%s\"}", targetUserId, roleName)
        );

        sendAdminSetupEmail(targetUser);

        return toDTOWithUserDetails(saved);
    }

    public void revokeAdminRole(Long superAdminId, Long targetUserId) throws Exception {
        AdminRole adminRole = adminRoleRepository.findByUserId(targetUserId);
        if (adminRole == null) {
            throw new RuntimeException("Admin role not found");
        }
        if ("SUPER_ADMIN".equals(adminRole.getRoleName())) {
            throw new RuntimeException("Khong the go quyen Super Admin tai man hinh nay");
        }
        adminRole.setIsActive(false);
        adminRoleRepository.save(adminRole);
        userRepository.updateRole(targetUserId, "USER");
        refreshSessionRepository.revokeAllByUserId(targetUserId);

        auditService.logAction(
                superAdminId,
                "SUPER_ADMIN",
                "REVOKE_ADMIN_ROLE",
                "ADMIN",
                adminRole.getId(),
                String.format("{\"targetUserId\":%d}", targetUserId)
        );
    }

    public void resetAdminPassword(Long superAdminId, Long targetAdminId) throws Exception {
        User admin = userRepository.findById(targetAdminId);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }

        String resetToken = createSetPasswordToken(targetAdminId);
        String resetLink = frontendUrl + "/set-password?token=" + resetToken;

        emailService.send(
                admin.getEmail(),
                "Dat lai mat khau - VietCommerce Hub",
                buildPasswordResetEmail(admin.getFullName(), resetLink)
        );

        auditService.logAction(
                superAdminId,
                "SUPER_ADMIN",
                "RESET_ADMIN_PASSWORD",
                "USER",
                targetAdminId,
                "{\"resetTokenSent\":true}"
        );
    }

    public AdminRoleDTO updateAdminAccountStatus(Long superAdminId, Long targetAdminId, String status) throws Exception {
        User admin = userRepository.findById(targetAdminId);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }

        AdminRole adminRole = adminRoleRepository.findByUserId(targetAdminId);
        if (adminRole == null || !Boolean.TRUE.equals(adminRole.getIsActive())) {
            throw new RuntimeException("Admin role not found");
        }
        if ("SUPER_ADMIN".equals(adminRole.getRoleName())) {
            throw new RuntimeException("Khong the khoa Super Admin tai man hinh nay");
        }

        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (!"ACTIVE".equals(normalizedStatus) && !"BLOCKED".equals(normalizedStatus)) {
            throw new RuntimeException("Trang thai khong hop le");
        }

        int activeValue = "ACTIVE".equals(normalizedStatus) ? 1 : 0;
        if (!userRepository.updateActiveStatus(targetAdminId, activeValue)) {
            throw new RuntimeException("Cap nhat trang thai Admin that bai");
        }

        int revokedSessions = 0;
        if ("BLOCKED".equals(normalizedStatus)) {
            revokedSessions = refreshSessionRepository.revokeAllByUserId(targetAdminId);
        }

        auditService.logAction(
                superAdminId,
                "SUPER_ADMIN",
                "ACTIVE".equals(normalizedStatus) ? "UNBLOCK_ADMIN" : "BLOCK_ADMIN",
                "ADMIN",
                adminRole.getId(),
                String.format("{\"targetUserId\":%d,\"status\":\"%s\",\"revokedSessions\":%d}",
                        targetAdminId, normalizedStatus, revokedSessions)
        );

        return toDTOWithUserDetails(adminRole);
    }

    public List<AdminRoleDTO> getAllAdmins() {
        List<AdminRole> adminRoles = adminRoleRepository.findByIsActiveTrue();
        List<Long> userIds = adminRoles.stream()
                .flatMap(role -> Stream.of(role.getUserId(), role.getCreatedBy()))
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, User> usersById = userRepository.findByIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user, (first, ignored) -> first));

        return adminRoles
                .stream()
                .map(role -> toDTOWithUserDetails(role, usersById))
                .collect(Collectors.toList());
    }

    private AdminRoleDTO toDTO(AdminRole entity) {
        return new AdminRoleDTO(
                entity.getId(),
                entity.getUserId(),
                entity.getRoleName(),
                entity.getCreatedAt(),
                entity.getCreatedBy(),
                entity.getIsActive()
        );
    }

    private AdminRoleDTO toDTOWithUserDetails(AdminRole entity) {
        AdminRoleDTO dto = toDTO(entity);
        User user = userRepository.findById(entity.getUserId());
        if (user != null) {
            dto.setUserName(user.getFullName());
            dto.setUserEmail(user.getEmail());
            dto.setAccountActive(user.getIsActive() != null && user.getIsActive() == 1);
            dto.setLastLogin(user.getLastLogin());
        }
        User createdBy = userRepository.findById(entity.getCreatedBy());
        if (createdBy != null) {
            dto.setCreatedByName(createdBy.getFullName());
        }
        return dto;
    }

    private AdminRoleDTO toDTOWithUserDetails(AdminRole entity, Map<Long, User> usersById) {
        AdminRoleDTO dto = toDTO(entity);
        User user = usersById.get(entity.getUserId());
        if (user != null) {
            dto.setUserName(user.getFullName());
            dto.setUserEmail(user.getEmail());
            dto.setAccountActive(user.getIsActive() != null && user.getIsActive() == 1);
            dto.setLastLogin(user.getLastLogin());
        }
        User createdBy = usersById.get(entity.getCreatedBy());
        if (createdBy != null) {
            dto.setCreatedByName(createdBy.getFullName());
        }
        return dto;
    }

    private void sendAdminSetupEmail(User user) throws Exception {
        String setupToken = createSetPasswordToken(user.getId());
        String setupLink = frontendUrl + "/set-password?token=" + setupToken;
        emailService.send(
                user.getEmail(),
                "Ban da duoc cap quyen Admin - VietCommerce Hub",
                buildAdminSetupEmail(user.getFullName(), setupLink)
        );
    }

    private String createSetPasswordToken(Long userId) {
        passwordResetTokenRepository.invalidateExistingForUser(userId, "SET_PASSWORD");
        return passwordResetTokenRepository.createForUser(userId, "SET_PASSWORD", 24);
    }

    private String safeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String buildAdminSetupEmail(String name, String link) {
        String safeName = name == null || name.isBlank() ? "Admin" : name;
        return """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#334155">
                  <h2 style="color:#1e40af">VietCommerce Hub - Cap quyen Admin</h2>
                  <p>Xin chao <strong>%s</strong>,</p>
                  <p>Ban da duoc cap quyen Admin. Vui long thiet lap mat khau bang lien ket ben duoi.</p>
                  <p><a href="%s" style="display:inline-block;background:#2563eb;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Thiet lap mat khau</a></p>
                  <p style="font-size:12px;color:#64748b">Link nay co thoi han ngan, khong chia se voi nguoi khac.</p>
                </div>
                """.formatted(safeName, link);
    }

    private String buildPasswordResetEmail(String name, String link) {
        String safeName = name == null || name.isBlank() ? "Admin" : name;
        return """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#334155">
                  <h2 style="color:#1e40af">VietCommerce Hub - Dat lai mat khau</h2>
                  <p>Xin chao <strong>%s</strong>,</p>
                  <p>SUPER_ADMIN da tao yeu cau dat lai mat khau cho tai khoan cua ban.</p>
                  <p><a href="%s" style="display:inline-block;background:#2563eb;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Dat lai mat khau</a></p>
                </div>
                """.formatted(safeName, link);
    }
}
