package docker_test.com.controllers;

import docker_test.com.dto.admin.AuditLogDTO;
import docker_test.com.services.AuditService;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/audit-logs")
public class AuditLogController {

    private final AuditService auditService;

    public AuditLogController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        Page<AuditLogDTO> logs = auditService.getAllAuditLogs(actorId, action, resourceType, startDate, endDate, pageable);

        return ResponseEntity.ok(Map.of(
                "data", logs.getContent(),
                "pagination", Map.of(
                        "page", logs.getNumber(),
                        "size", logs.getSize(),
                        "total", logs.getTotalElements(),
                        "totalPages", logs.getTotalPages()
                )
        ));
    }

    @GetMapping("/my-logs")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','SELLER','USER','CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal Object principal) {

        Long userId = extractUserIdFromToken(principal);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        Page<AuditLogDTO> logs = auditService.getMyAuditLogs(userId, startDate, endDate, pageable);

        return ResponseEntity.ok(Map.of(
                "data", logs.getContent(),
                "pagination", Map.of(
                        "page", logs.getNumber(),
                        "size", logs.getSize(),
                        "total", logs.getTotalElements(),
                        "totalPages", logs.getTotalPages()
                )
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
