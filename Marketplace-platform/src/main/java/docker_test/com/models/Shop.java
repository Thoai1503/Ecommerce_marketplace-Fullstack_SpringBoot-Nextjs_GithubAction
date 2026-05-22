package docker_test.com.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public final class Shop {
	private Long id;
	private long user_id;
	private String shop_name;
	private String shop_description;
	private String shop_logo;
	private String shop_banner;
	private String owner_name;
	private String url_card_front;
	private String url_card_back;
	private String business_license;
	private String tax_code;
	private Double rating;
	private int total_products;
	private int total_orders;
	private Double total_revenue = 0.0;
	private Double response_rate;
	private int response_time;
	private int is_verified;
	private int is_active;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	@JsonProperty("onboarding_step")
	private Integer onboarding_step;
	private int followers;

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
		this.onboarding_step = 1;
		this.followers = 0;
	}

	public Shop(Long id, long user_id, String shop_name, String shop_description, String shop_logo, String shop_banner,
			String owner_name, String url_card_front, String url_card_back, String business_license, String tax_code,
			Double rating, int total_products, int total_orders, Double response_rate, int response_time,
			int is_verified, int is_active, LocalDateTime created_at, LocalDateTime updated_at,
			Integer onboarding_step) {
		this.id = id;
		this.user_id = user_id;
		this.shop_name = shop_name;
		this.shop_description = shop_description;
		this.shop_logo = shop_logo;
		this.shop_banner = shop_banner;
		this.owner_name = owner_name;
		this.url_card_front = url_card_front;
		this.url_card_back = url_card_back;
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
		this.onboarding_step = onboarding_step;
	}

	public Long getId() {
		return id;
	}

	public void setId(long shopId) {
		this.id = shopId;
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

	public String getOwner_name() {
		return owner_name;
	}

	public void setOwner_name(String owner_name) {
		this.owner_name = owner_name;
	}

	public String getUrl_card_front() {
		return url_card_front;
	}

	public void setUrl_card_front(String url_card_front) {
		this.url_card_front = url_card_front;
	}

	public String getUrl_card_back() {
		return url_card_back;
	}

	public void setUrl_card_back(String url_card_back) {
		this.url_card_back = url_card_back;
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

	public Double getTotal_revenue() {
		return total_revenue;
	}

	public void setTotal_revenue(Double total_revenue) {
		this.total_revenue = total_revenue == null ? 0.0 : total_revenue;
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

	public Integer getOnboarding_step() {
		return onboarding_step;
	}

	public void setOnboarding_step(Integer onboarding_step) {
		this.onboarding_step = onboarding_step;
	}

	public int getFollowers() {
		return followers;
	}

	public void setFollowers(int followers) {
		this.followers = followers;
	}
}
