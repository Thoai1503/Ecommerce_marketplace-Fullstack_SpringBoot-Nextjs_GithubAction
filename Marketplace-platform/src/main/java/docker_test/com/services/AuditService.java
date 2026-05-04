package docker_test.com.services;

import docker_test.com.dto.admin.AuditLogDTO;
import docker_test.com.models.AuditLog;
import docker_test.com.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectProvider<HttpServletRequest> requestProvider;

    public AuditService(AuditLogRepository auditLogRepository,
                        ObjectProvider<HttpServletRequest> requestProvider) {
        this.auditLogRepository = auditLogRepository;
        this.requestProvider = requestProvider;
    }

    public void logAction(Long actorId, String actorRole, String action, String resourceType, Long resourceId, String details) {
        if (actorId == null) {
            return;
        }
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorRole(actorRole != null ? actorRole : "ADMIN");
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setDetails(details);
        log.setStatus("SUCCESS");
        log.setIpAddress(clientIp());
        log.setUserAgent(userAgent());
        log.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public Page<AuditLogDTO> getMyAuditLogs(Long actorId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByActorIdAndCreatedAtBetween(actorId, startDate, endDate, pageable)
                .map(this::toDTO);
    }

    public Page<AuditLogDTO> getAllAuditLogs(
            Long actorId,
            String action,
            String resourceType,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        String actionFilter = normalizeFilter(action);
        String resourceTypeFilter = normalizeFilter(resourceType);
        return auditLogRepository.findFiltered(actorId, actionFilter, resourceTypeFilter, startDate, endDate, pageable)
                .map(this::toDTO);
    }

    private AuditLogDTO toDTO(AuditLog entity) {
        AuditLogDTO dto = new AuditLogDTO(
                entity.getId(),
                entity.getActorId(),
                entity.getActorRole(),
                entity.getAction(),
                entity.getResourceType(),
                entity.getResourceId(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getIpAddress()
        );
        dto.setDetails(AuditLogDTO.parseDetails(entity.getDetails()));
        return dto;
    }

    private String normalizeFilter(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase();
    }

    private String clientIp() {
        HttpServletRequest request = requestProvider.getIfAvailable();
        if (request == null) {
            return null;
        }
        String h = request.getHeader("X-Forwarded-For");
        if (h != null && !h.isBlank()) {
            return h.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String userAgent() {
        HttpServletRequest request = requestProvider.getIfAvailable();
        return request != null ? request.getHeader("User-Agent") : null;
    }
}
