package docker_test.com.models;

import java.time.LocalDateTime;

public final class Cart {
    private long cart_id;
    private long user_id;
    private long product_id;
    private Long variant_id;
    private int quantity;
    private LocalDateTime added_at;
    private LocalDateTime updated_at;

    public Cart() {
        this.quantity = 0;
        this.added_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Cart(long cart_id, long user_id, long product_id, Long variant_id,
                int quantity, LocalDateTime added_at, LocalDateTime updated_at) {
        this.cart_id = cart_id;
        this.user_id = user_id;
        this.product_id = product_id;
        this.variant_id = variant_id;
        this.quantity = quantity;
        this.added_at = added_at;
        this.updated_at = updated_at;
    }

    public long getCartId() {
        return cart_id;
    }

    public void setCartId(long cart_id) {
        this.cart_id = cart_id;
    }

    public long getUserId() {
        return user_id;
    }

    public void setUserId(long user_id) {
        this.user_id = user_id;
    }

    public long getProductId() {
        return product_id;
    }

    public void setProductId(long product_id) {
        this.product_id = product_id;
    }

    public Long getVariantId() {
        return variant_id;
    }

    public void setVariantId(Long variant_id) {
        this.variant_id = variant_id;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getAddedAt() {
        return added_at;
    }

    public void setAddedAt(LocalDateTime added_at) {
        this.added_at = added_at;
    }

    public LocalDateTime getUpdatedAt() {
        return updated_at;
    }

    public void setUpdatedAt(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}