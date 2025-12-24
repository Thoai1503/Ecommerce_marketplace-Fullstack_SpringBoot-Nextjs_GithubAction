package docker_test.com.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Shop {

	private Long shopId;

	private Long userId;

	private String shopName;

	private String shopDescription;

	private String shopLogo;

	private String shopBanner;

	private String businessLicense;

	private String taxCode;

	private BigDecimal rating;

	private Integer totalProducts;

	private Integer totalOrders;

	private BigDecimal responseRate;

	private Integer responseTime;

	private Boolean isVerified;

	private Boolean isActive;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (isActive == null) {
			isActive = true;
		}
		if (isVerified == null) {
			isVerified = false;
		}
	}

	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	/* ===== Getter & Setter ===== */

	public Long getShopId() {
		return shopId;
	}

	public void setShopId(Long shopId) {
		this.shopId = shopId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
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

	public Integer getTotalProducts() {
		return totalProducts;
	}

	public void setTotalProducts(Integer totalProducts) {
		this.totalProducts = totalProducts;
	}

	public Integer getTotalOrders() {
		return totalOrders;
	}

	public void setTotalOrders(Integer totalOrders) {
		this.totalOrders = totalOrders;
	}

	public BigDecimal getResponseRate() {
		return responseRate;
	}

	public void setResponseRate(BigDecimal responseRate) {
		this.responseRate = responseRate;
	}

	public Integer getResponseTime() {
		return responseTime;
	}

	public void setResponseTime(Integer responseTime) {
		this.responseTime = responseTime;
	}

	public Boolean getIsVerified() {
		return isVerified;
	}

	public void setIsVerified(Boolean isVerified) {
		this.isVerified = isVerified;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public Shop() {
	}

	public Shop(Long shopId, Long userId, String shopName, String shopDescription, String shopLogo, String shopBanner,
			String businessLicense, String taxCode, BigDecimal rating, Integer totalProducts, Integer totalOrders,
			BigDecimal responseRate, Integer responseTime, Boolean isVerified, Boolean isActive,
			LocalDateTime createdAt, LocalDateTime updatedAt) {
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

}
