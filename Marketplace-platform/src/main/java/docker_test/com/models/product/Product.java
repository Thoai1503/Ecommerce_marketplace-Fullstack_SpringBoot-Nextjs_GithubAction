package docker_test.com.models.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class Product {
<<<<<<< HEAD

    private long productId;
    private long shopId;
    private long categoryId;

    private String productName;
    private String productSlug;
    private String description;

    /**
     * Giá hiển thị (derived)
     * = MIN(product_variant.price)
     * Có thể null khi chưa có variant
     */
    private BigDecimal price;
    private BigDecimal originalPrice;

    private int stockQuantity;
    private int soldCount;

    private BigDecimal rating;
    private int reviewCount;

    private BigDecimal weight;
    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;

    private String brand;

    /**
     * 0 = inactive
     * 1 = active
     */
    private int isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
=======
    
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
>>>>>>> fea303b6631c57acd3ce41240938eadd4d12e092

    /* ===================== CONSTRUCTOR ===================== */

    // Constructor mặc định
    public Product() {
<<<<<<< HEAD
        this.price = null;
        this.originalPrice = null;
        this.stockQuantity = 0;
        this.soldCount = 0;
        this.reviewCount = 0;
        this.rating = BigDecimal.ZERO;
        this.isActive = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor đầy đủ
    public Product(
            long productId,
            long shopId,
            long categoryId,
            String productName,
            String productSlug,
            String description,
            BigDecimal price,
            BigDecimal originalPrice,
            int stockQuantity,
            int soldCount,
            BigDecimal rating,
            int reviewCount,
            BigDecimal weight,
            BigDecimal length,
            BigDecimal width,
            BigDecimal height,
            String brand,
            int isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.productId = productId;
        this.shopId = shopId;
        this.categoryId = categoryId;
        this.productName = productName;
        this.productSlug = productSlug;
=======
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
>>>>>>> fea303b6631c57acd3ce41240938eadd4d12e092
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

<<<<<<< HEAD
    /* ===================== GETTER / SETTER ===================== */

    public long getProductId() {
        return productId;
    }

    public void setProductId(long productId) {
        this.productId = productId;
    }

    public long getShopId() {
        return shopId;
    }

    public void setShopId(long shopId) {
        this.shopId = shopId;
    }

    public long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(long categoryId) {
        this.categoryId = categoryId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public int getSoldCount() {
        return soldCount;
    }

    public void setSoldCount(int soldCount) {
        this.soldCount = soldCount;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public BigDecimal getLength() {
        return length;
    }

    public void setLength(BigDecimal length) {
        this.length = length;
    }

    public BigDecimal getWidth() {
        return width;
    }

    public void setWidth(BigDecimal width) {
        this.width = width;
    }

    public BigDecimal getHeight() {
        return height;
    }

    public void setHeight(BigDecimal height) {
        this.height = height;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public int getIsActive() {
        return isActive;
    }

    public void setIsActive(int isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
=======
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
>>>>>>> fea303b6631c57acd3ce41240938eadd4d12e092
