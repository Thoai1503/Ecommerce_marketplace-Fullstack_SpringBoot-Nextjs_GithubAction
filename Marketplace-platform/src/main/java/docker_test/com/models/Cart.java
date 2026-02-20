package docker_test.com.models;

import java.time.LocalDateTime;

public final class Cart {
    private Integer cart_id;
    private Integer user_id;
    private Integer product_id;
    private Integer variant_id;
    private Integer quantity;
    private LocalDateTime added_at;
    private LocalDateTime updated_at;

    public Cart() {
        this.quantity = 0;
        this.added_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Cart(Integer cart_id, Integer user_id, Integer product_id, Integer variant_id,
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

    public void setCartId(Integer cart_id) {
        this.cart_id = cart_id;
    }

    public long getUserId() {
        return user_id;
    }

    public void setUserId(Integer user_id) {
        this.user_id = user_id;
    }

    public long getProductId() {
        return product_id;
    }

    public void setProductId(Integer product_id) {
        this.product_id = product_id;
    }

    public Integer getVariantId() {
        return variant_id;
    }

    public void setVariantId(Integer variant_id) {
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