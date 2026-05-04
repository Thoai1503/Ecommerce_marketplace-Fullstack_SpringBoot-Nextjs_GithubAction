package docker_test.com.repository;

import docker_test.com.models.AuditLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByActorId(Long actorId);

    List<AuditLog> findByActorIdAndCreatedAtBetween(Long actorId, LocalDateTime start, LocalDateTime end);

    Page<AuditLog> findByActorIdAndCreatedAtBetween(Long actorId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    List<AuditLog> findByActionAndResourceType(String action, String resourceType);

    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, Long resourceId);

    Page<AuditLog> findByActorId(Long actorId, Pageable pageable);

    Page<AuditLog> findAll(Pageable pageable);

    Page<AuditLog> findByActorIdAndActionAndCreatedAtBetween(
            Long actorId,
            String action,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    @Query("""
            select al from AuditLog al
            where al.createdAt between :start and :end
              and (:actorId is null or al.actorId = :actorId)
              and (:action is null or al.action = :action)
              and (:resourceType is null or al.resourceType = :resourceType)
            """)
    Page<AuditLog> findFiltered(
            @Param("actorId") Long actorId,
            @Param("action") String action,
            @Param("resourceType") String resourceType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );
}
