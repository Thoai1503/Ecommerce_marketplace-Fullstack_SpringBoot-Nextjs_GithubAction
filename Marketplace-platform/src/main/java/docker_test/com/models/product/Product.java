package docker_test.com.models.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class Product {

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

    /* ===================== CONSTRUCTOR ===================== */

    // Constructor mặc định
    public Product() {
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
