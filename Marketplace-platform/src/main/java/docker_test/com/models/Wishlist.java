package docker_test.com.models;

import java.time.LocalDateTime;

public final class Wishlist {
    private long id;
    private long userId;
    private long productId;
    private LocalDateTime addedAt;

    public Wishlist() {
        this.addedAt = LocalDateTime.now();
    }

    public Wishlist(long id, long userId, long productId, LocalDateTime addedAt) {
        this.id = id;
        this.userId = userId;
        this.productId = productId;
        this.addedAt = addedAt;
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }

    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}