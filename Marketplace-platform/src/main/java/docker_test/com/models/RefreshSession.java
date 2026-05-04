package docker_test.com.models;

import java.time.LocalDateTime;

public class RefreshSession {
    private String id;
    private Long userId;
    private String tokenHash;
    private String userAgent;
    private String ipFirst;
    private String ipLast;
    private LocalDateTime expiresAt;
    private LocalDateTime revokedAt;
    private String rotatedFrom;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;

    public RefreshSession() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getIpFirst() {
        return ipFirst;
    }

    public void setIpFirst(String ipFirst) {
        this.ipFirst = ipFirst;
    }

    public String getIpLast() {
        return ipLast;
    }

    public void setIpLast(String ipLast) {
        this.ipLast = ipLast;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }

    public String getRotatedFrom() {
        return rotatedFrom;
    }

    public void setRotatedFrom(String rotatedFrom) {
        this.rotatedFrom = rotatedFrom;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
}
