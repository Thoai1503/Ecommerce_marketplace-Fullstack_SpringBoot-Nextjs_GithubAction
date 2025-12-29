package docker_test.com.models;

import java.time.LocalDateTime;

public final class Shop {
    private long shopId;
    private long userId;
    private String shopName;
    private String shopDescription;
    private String shopLogo;
    private String shopBanner;
    private String businessLicense;
    private String taxCode;
    private Double rating;
    private int totalProducts;
    private int totalOrders;
    private Double responseRate;
    private int responseTime;
    private int isVerified;
    private int isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Shop() {
        this.rating = 0.0;
        this.totalProducts = 0;
        this.totalOrders = 0;
        this.responseRate = 0.0;
        this.responseTime = 0;
        this.isVerified = 0;
        this.isActive = 1;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Shop(long shopId, long userId, String shopName, String shopDescription, String shopLogo,
                String shopBanner, String businessLicense, String taxCode, Double rating,
                int totalProducts, int totalOrders, Double responseRate, int responseTime,
                int isVerified, int isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.shopId = shopId;
        this.userId = userId;
        this.shopName = shopName;
        this.shopDescription = shopDescription;
        this.shopLogo = shopLogo;
        this.shopBanner = shopBanner;
        this.businessLicense = businessLicense;
        this.taxCode = taxCode;
        this.rating = rating;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.responseRate = responseRate;
        this.responseTime = responseTime;
        this.isVerified = isVerified;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public long getShopId() { return shopId; }
    public void setShopId(long shopId) { this.shopId = shopId; }
    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getShopDescription() { return shopDescription; }
    public void setShopDescription(String shopDescription) { this.shopDescription = shopDescription; }
    public String getShopLogo() { return shopLogo; }
    public void setShopLogo(String shopLogo) { this.shopLogo = shopLogo; }
    public String getShopBanner() { return shopBanner; }
    public void setShopBanner(String shopBanner) { this.shopBanner = shopBanner; }
    public String getBusinessLicense() { return businessLicense; }
    public void setBusinessLicense(String businessLicense) { this.businessLicense = businessLicense; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public int getTotalProducts() { return totalProducts; }
    public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }
    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    public Double getResponseRate() { return responseRate; }
    public void setResponseRate(Double responseRate) { this.responseRate = responseRate; }
    public int getResponseTime() { return responseTime; }
    public void setResponseTime(int responseTime) { this.responseTime = responseTime; }
    public int isVerified() { return isVerified; }
    public void setVerified(int verified) { isVerified = verified; }
    public int isActive() { return isActive; }
    public void setActive(int active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
