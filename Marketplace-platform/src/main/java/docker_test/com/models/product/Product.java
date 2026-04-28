package docker_test.com.models.product;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;

import docker_test.com.models.Shop;

public final class Product {

	private Integer id;
	private Integer shop_id;
	private String product_slug;
	private Integer category_id;
	private String description;
	private String image_url;
	private Double original_price;
	private Double price;
	private String category_name;
	private String product_name;
	private Shop shop;
	private List<ProductImage> images;
	private Integer stock_quantity = null;
	private Integer sold_count = null;
	private Double rating;
	private Integer review_count = null;
	private Integer weight;
	private Integer length;
	private Integer width;
	private Integer height;
	private Integer brand_id;
	private Integer is_active = 1;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;
	

	public String getCategory_name() {
		return category_name;
	}

	public void setCategory_name(String category_name) {
		this.category_name = category_name;
	}

	public Shop getShop() {
		return shop;
	}

	public void setShop(Shop shop) {
		this.shop = shop;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImage_url() {
		return image_url;
	}

	public void setImage_url(String image_url) {
		this.image_url = image_url;
	}

	public Integer getShop_id() {
		return shop_id;
	}

	public void setShop_id(Integer shop_id) {
		this.shop_id = shop_id;
	}

	public Integer getCategory_id() {
		return category_id;
	}

	public void setCategory_id(Integer category_id) {
		this.category_id = category_id;
	}

	public String getProduct_name() {
		return product_name;
	}

	public void setProduct_name(String product_name) {
		this.product_name = product_name;
	}

	public String getProduct_slug() {
		return product_slug;
	}

	public void setProduct_slug(String product_slug) {
		this.product_slug = product_slug;
	}

	public Double getOriginal_price() {
		return original_price;
	}

	public void setOriginal_price(Double original_price) {
		this.original_price = original_price;
	}

	public Integer getStock_quantity() {
		return stock_quantity;
	}

	public void setStock_quantity(Integer stock_quantity) {
		this.stock_quantity = stock_quantity;
	}

	public Integer getSold_count() {
		return sold_count;
	}

	public void setSold_count(Integer sold_count) {
		this.sold_count = sold_count;
	}

	public Integer getReview_count() {
		return review_count;
	}

	public void setReview_count(Integer review_count) {
		this.review_count = review_count;
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

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public Integer getWeight() {
		return weight;
	}

	public void setWeight(Integer weight) {
		this.weight = weight;
	}

	public Integer getLength() {
		return length;
	}

	public void setLength(Integer length) {
		this.length = length;
	}

	public Integer getWidth() {
		return width;
	}

	public void setWidth(Integer width) {
		this.width = width;
	}

	public Integer getHeight() {
		return height;
	}

	public void setHeight(Integer height) {
		this.height = height;
	}

	public Integer getBrand() {
		return brand_id;
	}

	public void setBrand(Integer brand_id) {
		this.brand_id = brand_id;
	}

	public Integer getIs_active() {
		return is_active;
	}

	public void setIs_active(Integer is_active) {
		this.is_active = is_active;
	}

	public List<ProductVariant> getVariants() {
		return variants;
	}

	public void setVariants(List<ProductVariant> variants) {
		this.variants = variants;
	}

	private List<ProductVariant> variants;

	public List<ProductImage> getImages() {
		return images;
	}

	public void setImages(List<ProductImage> images) {
		this.images = images;
	}

	public Product() {
		this.stock_quantity = 0;
		this.sold_count = 0;
		this.rating = 0.0;
		this.review_count = 0;
		this.is_active = 1;
		this.created_at = LocalDateTime.now();
		this.updated_at = LocalDateTime.now();
	}

	public Product(Integer id, Integer shop_id, Integer category_id, String product_name, String product_slug,
			String description, Double price, Double original_price, Integer stock_quantity, Integer sold_count,
			Double rating, Integer review_count, Integer weight, Integer length, Integer width, Integer height,
			Integer brand_id, Integer is_active, LocalDateTime created_at, LocalDateTime updated_at) {
		this.id = id;
		this.shop_id = shop_id;
		this.category_id = category_id;
		this.product_name = product_name;
		this.product_slug = product_slug;
		this.description = description;
		this.price = price;
		this.original_price = original_price;
		this.stock_quantity = stock_quantity;
		this.sold_count = sold_count;
		this.rating = rating;
		this.review_count = review_count;
		this.weight = weight;
		this.length = length;
		this.width = width;
		this.height = height;
		this.brand_id = brand_id;
		this.is_active = is_active;
		this.created_at = created_at;
		this.updated_at = updated_at;
	}

	@Override
	public String toString() {
		return "Product{" + "id=" + id + ", shop_id=" + shop_id + ", category_id=" + category_id + ", product_name='"
				+ product_name + '\'' + ", product_slug='" + product_slug + '\'' + ", description='" + description
				+ '\'' + ", price=" + price + ", original_price=" + original_price + ", stock_quantity="
				+ stock_quantity + ", sold_count=" + sold_count + ", rating=" + rating + ", review_count="
				+ review_count + ", weight=" + weight + ", length=" + length + ", width=" + width + ", height=" + height
				+ ", brand='" + brand_id + '\'' + ", is_active=" + is_active + ", created_at=" + created_at
				+ ", updated_at=" + updated_at + '}';
	}
}