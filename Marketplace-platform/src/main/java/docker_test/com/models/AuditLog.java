package docker_test.com.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @Column(name = "actor_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long actorId;

    @Column(name = "actor_role", nullable = false, length = 50)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String actorRole;

    @Column(nullable = false, length = 100)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String action;

    @Column(name = "resource_type", nullable = false, length = 50)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String resourceType;

    @Column(name = "resource_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long resourceId;

    @Column(columnDefinition = "json")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String details;

    @Column(length = 20)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String status = "SUCCESS";

    @Column(name = "ip_address", length = 45)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String ipAddress;

    @Column(name = "user_agent")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String userAgent;

    @Column(name = "created_at")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "SUCCESS";
        }
    }
}
