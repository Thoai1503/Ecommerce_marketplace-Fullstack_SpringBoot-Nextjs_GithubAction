package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class Product {
    
    private long product_id;
    private long shop_id;
    private long category_id;
    private String product_name;
    private String product_slug;
    private String description;
    private Double price;
    private Double original_price;
    private int stock_quantity;
    private int sold_count;
    private Double rating;
    private int review_count;
    private Double weight;
    private Double length;
    private Double width;
    private Double height;
    private String brand;
    private int is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Product() {
        this.stock_quantity = 0;
        this.sold_count = 0;
        this.rating = 0.0;
        this.review_count = 0;
        this.is_active = 1;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Product(long productId, long shopId, long categoryId, String productName,
                   String productSlug, String description, Double price, Double originalPrice,
                   int stockQuantity, int soldCount, Double rating, int reviewCount,
                   Double weight, Double length, Double width, Double height,
                   String brand, int isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.product_id = productId;
        this.shop_id = shopId;
        this.category_id = categoryId;
        this.product_name = productName;
        this.product_slug = productSlug;
        this.description = description;
        this.price = price;
        this.original_price = originalPrice;
        this.stock_quantity = stockQuantity;
        this.sold_count = soldCount;
        this.rating = rating;
        this.review_count = reviewCount;
        this.weight = weight;
        this.length = length;
        this.width = width;
        this.height = height;
        this.brand = brand;
        this.is_active = isActive;
        this.created_at = createdAt;
        this.updated_at = updatedAt;
    }

    // Getters & Setters (giữ tên camelCase theo JavaBean convention)
    public long getProductId() { return product_id; }
    public void setProductId(long productId) { this.product_id = productId; }
    
    public long getShopId() { return shop_id; }
    public void setShopId(long shopId) { this.shop_id = shopId; }
    
    public long getCategoryId() { return category_id; }
    public void setCategoryId(long categoryId) { this.category_id = categoryId; }
    
    public String getProductName() { return product_name; }
    public void setProductName(String productName) { this.product_name = productName; }
    
    public String getProductSlug() { return product_slug; }
    public void setProductSlug(String productSlug) { this.product_slug = productSlug; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Double getOriginalPrice() { return original_price; }
    public void setOriginalPrice(Double originalPrice) { this.original_price = originalPrice; }
    
    public int getStockQuantity() { return stock_quantity; }
    public void setStockQuantity(int stockQuantity) { this.stock_quantity = stockQuantity; }
    
    public int getSoldCount() { return sold_count; }
    public void setSoldCount(int soldCount) { this.sold_count = soldCount; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public int getReviewCount() { return review_count; }
    public void setReviewCount(int reviewCount) { this.review_count = reviewCount; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    
    public Double getLength() { return length; }
    public void setLength(Double length) { this.length = length; }
    
    public Double getWidth() { return width; }
    public void setWidth(Double width) { this.width = width; }
    
    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }
    
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    
    public int getIsActive() { return is_active; }  // hoặc giữ isActive() tùy convention
    public void setIsActive(int isActive) { this.is_active = isActive; }
    
    public LocalDateTime getCreatedAt() { return created_at; }
    public void setCreatedAt(LocalDateTime createdAt) { this.created_at = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updated_at; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updated_at = updatedAt; }
}