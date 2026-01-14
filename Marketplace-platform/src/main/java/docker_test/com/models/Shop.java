package docker_test.com.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class Shop {

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
