package docker_test.com.models;

import java.time.LocalDateTime;

public final class ShopFollower {
    private long followId;
    private long userId;
    private long shopId;
    private LocalDateTime followedAt;

    public ShopFollower() {
        this.followedAt = LocalDateTime.now();
    }

    public ShopFollower(long followId, long userId, long shopId, LocalDateTime followedAt) {
        this.followId = followId;
        this.userId = userId;
        this.shopId = shopId;
        this.followedAt = followedAt;
    }

    public long getFollowId() { return followId; }
    public void setFollowId(long followId) { this.followId = followId; }
    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }
    public long getShopId() { return shopId; }
    public void setShopId(long shopId) { this.shopId = shopId; }
    public LocalDateTime getFollowedAt() { return followedAt; }
    public void setFollowedAt(LocalDateTime followedAt) { this.followedAt = followedAt; }
}

