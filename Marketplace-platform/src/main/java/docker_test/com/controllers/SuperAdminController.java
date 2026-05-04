package docker_test.com.controllers;

import docker_test.com.dto.admin.AdminRoleDTO;
import docker_test.com.dto.admin.CreateAdminRequestDTO;
import docker_test.com.dto.admin.GrantAdminRoleRequest;
import docker_test.com.dto.admin.ResetAdminPasswordRequest;
import docker_test.com.dto.admin.UserStatusUpdateRequestDTO;
import docker_test.com.services.AdminRoleService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/super")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final AdminRoleService adminRoleService;

    public SuperAdminController(AdminRoleService adminRoleService) {
        this.adminRoleService = adminRoleService;
    }

    @PostMapping("/roles/grant")
    public ResponseEntity<Map<String, Object>> grantAdminRole(
            @Valid @RequestBody GrantAdminRoleRequest req,
            @AuthenticationPrincipal Object principal) {
        try {
            Long superAdminId = extractUserIdFromToken(principal);
            AdminRoleDTO result = adminRoleService.grantAdminRole(superAdminId, req.getUserId(), "ADMIN");
            return ResponseEntity.ok(Map.of(
                    "message", "Cap quyen thanh cong",
                    "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createAdmin(
            @Valid @RequestBody CreateAdminRequestDTO req,
            @AuthenticationPrincipal Object principal) {
        try {
            Long superAdminId = extractUserIdFromToken(principal);
            AdminRoleDTO result = adminRoleService.createAdminAccount(
                    superAdminId,
                    req.getEmail(),
                    req.getFullName(),
                    req.getPhone()
            );
            return ResponseEntity.ok(Map.of(
                    "message", "Tao tai khoan Admin thanh cong",
                    "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/roles/{userId}")
    public ResponseEntity<Map<String, Object>> revokeAdminRole(
            @PathVariable Long userId,
            @AuthenticationPrincipal Object principal) {
        try {
            Long superAdminId = extractUserIdFromToken(principal);
            adminRoleService.revokeAdminRole(superAdminId, userId);
            return ResponseEntity.ok(Map.of("message", "Bo quyen thanh cong"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetAdminPassword(
            @Valid @RequestBody ResetAdminPasswordRequest req,
            @AuthenticationPrincipal Object principal) {
        try {
            Long superAdminId = extractUserIdFromToken(principal);
            adminRoleService.resetAdminPassword(superAdminId, req.getAdminId());
            return ResponseEntity.ok(Map.of("message", "Link reset da duoc gui den email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/users/{adminId}/status")
    public ResponseEntity<Map<String, Object>> updateAdminStatus(
            @PathVariable Long adminId,
            @Valid @RequestBody UserStatusUpdateRequestDTO req,
            @AuthenticationPrincipal Object principal) {
        try {
            Long superAdminId = extractUserIdFromToken(principal);
            AdminRoleDTO result = adminRoleService.updateAdminAccountStatus(
                    superAdminId,
                    adminId,
                    req.getStatus()
            );
            return ResponseEntity.ok(Map.of(
                    "message", "Cap nhat trang thai Admin thanh cong",
                    "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> listAdmins() {
        List<AdminRoleDTO> admins = adminRoleService.getAllAdmins();
        return ResponseEntity.ok(Map.of(
                "data", admins,
                "total", admins.size()
        ));
    }

    private Long extractUserIdFromToken(Object principal) {
        if (principal instanceof Long id) {
            return id;
        }
        if (principal instanceof String value) {
            return Long.valueOf(value);
        }
        if (principal instanceof UserDetails userDetails) {
            return Long.valueOf(userDetails.getUsername());
        }
        throw new RuntimeException("Khong xac dinh duoc nguoi dung dang nhap");
    }
}
