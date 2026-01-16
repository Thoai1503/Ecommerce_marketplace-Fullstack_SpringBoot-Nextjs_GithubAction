package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductVariant {
    private long variant_id;
    private long product_id;
    private String variant_name;
    private String sku;
    private Double price;
    private int stock_quantity;
    private String image_url;
    private int is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public ProductVariant() {
        this.stock_quantity = 0;
        this.is_active = 1;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public ProductVariant(long variant_id, long product_id, String variant_name, String sku, 
                         Double price, int stock_quantity, String image_url, int is_active,
                         LocalDateTime created_at, LocalDateTime updated_at) {
        this.variant_id = variant_id;
        this.product_id = product_id;
        this.variant_name = variant_name;
        this.sku = sku;
        this.price = price;
        this.stock_quantity = stock_quantity;
        this.image_url = image_url;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public long getVariantId() {
        return variant_id;
    }

    public void setVariantId(long variant_id) {
        this.variant_id = variant_id;
    }

    public long getProductId() {
        return product_id;
    }

    public void setProductId(long product_id) {
        this.product_id = product_id;
    }

    public String getVariantName() {
        return variant_name;
    }

    public void setVariantName(String variant_name) {
        this.variant_name = variant_name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public int getStockQuantity() {
        return stock_quantity;
    }

    public void setStockQuantity(int stock_quantity) {
        this.stock_quantity = stock_quantity;
    }

    public String getImageUrl() {
        return image_url;
    }

    public void setImageUrl(String image_url) {
        this.image_url = image_url;
    }

    public int isActive() {
        return is_active;
    }

    public void setActive(int is_active) {
        this.is_active = is_active;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdatedAt() {
        return updated_at;
    }

    public void setUpdatedAt(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}