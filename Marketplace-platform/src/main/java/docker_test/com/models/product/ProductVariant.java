package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductVariant {
    private Integer id;
    private Integer product_id;
    private String variant_name;
    private String sku;
    private Double price;
    private int stock_quantity;
    private String image_url;
    private Long weight;
    private Long length;
    private Long width;
    private Long height;
    private Integer is_active;
    
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public ProductVariant() {
        this.stock_quantity = 0;
        this.is_active = 1;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public ProductVariant(Integer id, Integer product_id, String variant_name, String sku, 
                         Double price, int stock_quantity, String image_url, Integer is_active,
                         LocalDateTime created_at, LocalDateTime updated_at) {
        this.id = id;
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

    public Integer getId() {
        return id;
    }

    public void setVariant_id(Integer variant_id) {
        this.id = variant_id;
    }

    public long getProduct_id() {
        return product_id;
    }

    public void setProduct_id(Integer product_id) {
        this.product_id = product_id;
    }

    public String getVariant_name() {
        return variant_name;
    }

    public void setVariant_name(String variant_name) {
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

    public int getStock_quantity() {
        return stock_quantity;
    }

    public void setStock_quantity(int stock_quantity) {
        this.stock_quantity = stock_quantity;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }

    public Long getWeight() {
        return weight;
    }

    public void setWeight(Long weight) {
        this.weight = weight;
    }

    public Long getLength() {
        return length;
    }

    public void setLength(Long length) {
        this.length = length;
    }

    public Long getWidth() {
        return width;
    }

    public void setWidth(Long width) {
        this.width = width;
    }

    public Long getHeight() {
        return height;
    }

    public void setHeight(Long height) {
        this.height = height;
    }

    public int isActive() {
        return is_active;
    }

    public void setActive(int is_active) {
        this.is_active = is_active;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}
