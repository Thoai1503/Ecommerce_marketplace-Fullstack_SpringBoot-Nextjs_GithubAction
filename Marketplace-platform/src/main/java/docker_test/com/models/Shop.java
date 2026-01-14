package docker_test.com.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class Shop {
<<<<<<< HEAD

	private long shopId;
	private long userId; // owner (user_id)

	private String shopName;
	private String shopDescription;
	private String shopLogo;
	private String shopBanner;

	private String businessLicense;
	private String taxCode;

	private BigDecimal rating;
	private int totalProducts;
	private int totalOrders;

	private BigDecimal responseRate; // %
	private int responseTime; // phút

	/**
	 * 0 = chưa xác minh 1 = đã xác minh
	 */
	private int isVerified;

	/**
	 * 0 = inactive / bị khoá 1 = active
	 */
	private int isActive;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	/* ===================== CONSTRUCTOR ===================== */

	// Constructor mặc định
	public Shop() {
		this.rating = BigDecimal.ZERO;
		this.totalProducts = 0;
		this.totalOrders = 0;
		this.responseRate = BigDecimal.ZERO;
		this.responseTime = 0;
		this.isVerified = 0;
		this.isActive = 1;
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	// Constructor đầy đủ
	public Shop(long shopId, long userId, String shopName, String shopDescription, String shopLogo, String shopBanner,
			String businessLicense, String taxCode, BigDecimal rating, int totalProducts, int totalOrders,
			BigDecimal responseRate, int responseTime, int isVerified, int isActive, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
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

	/* ===================== GETTER / SETTER ===================== */

	public long getShopId() {
		return shopId;
	}

	public void setShopId(long shopId) {
		this.shopId = shopId;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public String getShopName() {
		return shopName;
	}

	public void setShopName(String shopName) {
		this.shopName = shopName;
	}

	public String getShopDescription() {
		return shopDescription;
	}

	public void setShopDescription(String shopDescription) {
		this.shopDescription = shopDescription;
	}

	public String getShopLogo() {
		return shopLogo;
	}

	public void setShopLogo(String shopLogo) {
		this.shopLogo = shopLogo;
	}

	public String getShopBanner() {
		return shopBanner;
	}

	public void setShopBanner(String shopBanner) {
		this.shopBanner = shopBanner;
	}

	public String getBusinessLicense() {
		return businessLicense;
	}

	public void setBusinessLicense(String businessLicense) {
		this.businessLicense = businessLicense;
	}

	public String getTaxCode() {
		return taxCode;
	}

	public void setTaxCode(String taxCode) {
		this.taxCode = taxCode;
	}

	public BigDecimal getRating() {
		return rating;
	}

	public void setRating(BigDecimal rating) {
		this.rating = rating;
	}

	public int getTotalProducts() {
		return totalProducts;
	}

	public void setTotalProducts(int totalProducts) {
		this.totalProducts = totalProducts;
	}

	public int getTotalOrders() {
		return totalOrders;
	}

	public void setTotalOrders(int totalOrders) {
		this.totalOrders = totalOrders;
	}

	public BigDecimal getResponseRate() {
		return responseRate;
	}

	public void setResponseRate(BigDecimal responseRate) {
		this.responseRate = responseRate;
	}

	public int getResponseTime() {
		return responseTime;
	}

	public void setResponseTime(int responseTime) {
		this.responseTime = responseTime;
	}

	public int getIsVerified() {
		return isVerified;
	}

	public void setIsVerified(int isVerified) {
		this.isVerified = isVerified;
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
    private long shop_id;
    private long user_id;
    private String shop_name;
    private String shop_description;
    private String shop_logo;
    private String shop_banner;
    private String business_license;
    private String tax_code;
    private Double rating;
    private int total_products;
    private int total_orders;
    private Double response_rate;
    private int response_time;
    private int is_verified;
    private int is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Shop() {
        this.rating = 0.0;
        this.total_products = 0;
        this.total_orders = 0;
        this.response_rate = 0.0;
        this.response_time = 0;
        this.is_verified = 0;
        this.is_active = 1;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Shop(long shop_id, long user_id, String shop_name, String shop_description,
                String shop_logo, String shop_banner, String business_license, String tax_code,
                Double rating, int total_products, int total_orders, Double response_rate,
                int response_time, int is_verified, int is_active,
                LocalDateTime created_at, LocalDateTime updated_at) {
        this.shop_id = shop_id;
        this.user_id = user_id;
        this.shop_name = shop_name;
        this.shop_description = shop_description;
        this.shop_logo = shop_logo;
        this.shop_banner = shop_banner;
        this.business_license = business_license;
        this.tax_code = tax_code;
        this.rating = rating;
        this.total_products = total_products;
        this.total_orders = total_orders;
        this.response_rate = response_rate;
        this.response_time = response_time;
        this.is_verified = is_verified;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Getters and Setters
    public long getShopId() { return shop_id; }
    public void setShopId(long shop_id) { this.shop_id = shop_id; }
    
    public long getUserId() { return user_id; }
    public void setUserId(long user_id) { this.user_id = user_id; }
    
    public String getShopName() { return shop_name; }
    public void setShopName(String shop_name) { this.shop_name = shop_name; }
    
    public String getShopDescription() { return shop_description; }
    public void setShopDescription(String shop_description) { this.shop_description = shop_description; }
    
    public String getShopLogo() { return shop_logo; }
    public void setShopLogo(String shop_logo) { this.shop_logo = shop_logo; }
    
    public String getShopBanner() { return shop_banner; }
    public void setShopBanner(String shop_banner) { this.shop_banner = shop_banner; }
    
    public String getBusinessLicense() { return business_license; }
    public void setBusinessLicense(String business_license) { this.business_license = business_license; }
    
    public String getTaxCode() { return tax_code; }
    public void setTaxCode(String tax_code) { this.tax_code = tax_code; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public int getTotalProducts() { return total_products; }
    public void setTotalProducts(int total_products) { this.total_products = total_products; }
    
    public int getTotalOrders() { return total_orders; }
    public void setTotalOrders(int total_orders) { this.total_orders = total_orders; }
    
    public Double getResponseRate() { return response_rate; }
    public void setResponseRate(Double response_rate) { this.response_rate = response_rate; }
    
    public int getResponseTime() { return response_time; }
    public void setResponseTime(int response_time) { this.response_time = response_time; }
    
    public int isVerified() { return is_verified; }
    public void setVerified(int is_verified) { this.is_verified = is_verified; }
    
    public int isActive() { return is_active; }
    public void setActive(int is_active) { this.is_active = is_active; }
    
    public LocalDateTime getCreatedAt() { return created_at; }
    public void setCreatedAt(LocalDateTime created_at) { this.created_at = created_at; }
    
    public LocalDateTime getUpdatedAt() { return updated_at; }
    public void setUpdatedAt(LocalDateTime updated_at) { this.updated_at = updated_at; }
}
>>>>>>> fea303b6631c57acd3ce41240938eadd4d12e092
