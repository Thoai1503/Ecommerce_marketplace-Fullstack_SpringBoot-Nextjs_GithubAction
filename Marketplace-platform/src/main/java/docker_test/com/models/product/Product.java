package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class Product {
    private long productId;
    private long shopId;
    private long categoryId;
    private String productName;
    private String productSlug;
    private String description;
    private Double price;
    private Double originalPrice;
    private int stockQuantity;
    private int soldCount;
    private Double rating;
    private int reviewCount;
    private Double weight;
    private Double length;
    private Double width;
    private Double height;
    private String brand;
    private int isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product() {
        this.stockQuantity = 0;
        this.soldCount = 0;
        this.rating = 0.0;
        this.reviewCount = 0;
        this.isActive = 1;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Product(long productId, long shopId, long categoryId, String productName,
                   String productSlug, String description, Double price, Double originalPrice,
                   int stockQuantity, int soldCount, Double rating, int reviewCount,
                   Double weight, Double length, Double width, Double height,
                   String brand, int isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.productId = productId;
        this.shopId = shopId;
        this.categoryId = categoryId;
        this.productName = productName;
        this.productSlug = productSlug;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.stockQuantity = stockQuantity;
        this.soldCount = soldCount;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.weight = weight;
        this.length = length;
        this.width = width;
        this.height = height;
        this.brand = brand;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }
    public long getShopId() { return shopId; }
    public void setShopId(long shopId) { this.shopId = shopId; }
    public long getCategoryId() { return categoryId; }
    public void setCategoryId(long categoryId) { this.categoryId = categoryId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductSlug() { return productSlug; }
    public void setProductSlug(String productSlug) { this.productSlug = productSlug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public int getSoldCount() { return soldCount; }
    public void setSoldCount(int soldCount) { this.soldCount = soldCount; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
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
    public int isActive() { return isActive; }
    public void setActive(int active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}