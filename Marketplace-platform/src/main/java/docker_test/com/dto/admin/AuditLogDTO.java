package docker_test.com.dto.admin;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AuditLogDTO {
    private static final Gson GSON = new Gson();

    private Long id;
    private Long actorId;
    private String actorName;
    private String actorEmail;
    private String actorRole;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String resourceName;
    private Map<String, Object> details;
    private String status;
    private LocalDateTime createdAt;
    private String ipAddress;

    public AuditLogDTO(Long id, Long actorId, String actorRole, String action, String resourceType,
                       Long resourceId, String status, LocalDateTime createdAt, String ipAddress) {
        this.id = id;
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.status = status;
        this.createdAt = createdAt;
        this.ipAddress = ipAddress;
    }

    public Map<String, Object> getDetailsAsMap() {
        return details != null ? details : Collections.emptyMap();
    }

    public static Map<String, Object> parseDetails(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return GSON.fromJson(json, new TypeToken<Map<String, Object>>() {}.getType());
        } catch (Exception ignored) {
            return Map.of("raw", json);
        }
    }
}
