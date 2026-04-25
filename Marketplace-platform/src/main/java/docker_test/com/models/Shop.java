package docker_test.com.models;

import java.time.LocalDateTime;

public final class Shop {
	private long id;
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
	private String status; // PENDING | ACTIVE | REJECTED | BLOCKED
	private String rejection_reason;
	private String block_reason;
	private String category;
	private String website;
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

	public Shop(long id, long user_id, String shop_name, String shop_description, String shop_logo, String shop_banner,
			String business_license, String tax_code, Double rating, int total_products, int total_orders,
			Double response_rate, int response_time, int is_verified, int is_active, LocalDateTime created_at,
			LocalDateTime updated_at) {
		super();
		this.id = id;
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

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getUser_id() {
		return user_id;
	}

	public void setUser_id(long user_id) {
		this.user_id = user_id;
	}

	public String getShop_name() {
		return shop_name;
	}

	public void setShop_name(String shop_name) {
		this.shop_name = shop_name;
	}

	public String getShop_description() {
		return shop_description;
	}

	public void setShop_description(String shop_description) {
		this.shop_description = shop_description;
	}

	public String getShop_logo() {
		return shop_logo;
	}

	public void setShop_logo(String shop_logo) {
		this.shop_logo = shop_logo;
	}

	public String getShop_banner() {
		return shop_banner;
	}

	public void setShop_banner(String shop_banner) {
		this.shop_banner = shop_banner;
	}

	public String getBusiness_license() {
		return business_license;
	}

	public void setBusiness_license(String business_license) {
		this.business_license = business_license;
	}

	public String getTax_code() {
		return tax_code;
	}

	public void setTax_code(String tax_code) {
		this.tax_code = tax_code;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public int getTotal_products() {
		return total_products;
	}

	public void setTotal_products(int total_products) {
		this.total_products = total_products;
	}

	public int getTotal_orders() {
		return total_orders;
	}

	public void setTotal_orders(int total_orders) {
		this.total_orders = total_orders;
	}

	public Double getResponse_rate() {
		return response_rate;
	}

	public void setResponse_rate(Double response_rate) {
		this.response_rate = response_rate;
	}

	public int getResponse_time() {
		return response_time;
	}

	public void setResponse_time(int response_time) {
		this.response_time = response_time;
	}

	public int getIs_verified() {
		return is_verified;
	}

	public void setIs_verified(int is_verified) {
		this.is_verified = is_verified;
	}

	public int getIs_active() {
		return is_active;
	}

	public void setIs_active(int is_active) {
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

	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }

	public String getRejection_reason() { return rejection_reason; }
	public void setRejection_reason(String rejection_reason) { this.rejection_reason = rejection_reason; }

	public String getBlock_reason() { return block_reason; }
	public void setBlock_reason(String block_reason) { this.block_reason = block_reason; }

	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }

	public String getWebsite() { return website; }
	public void setWebsite(String website) { this.website = website; }
}