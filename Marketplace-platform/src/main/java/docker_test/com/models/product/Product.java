package docker_test.com.models.product;

import java.time.LocalDateTime;
import java.util.List;

public final class Product {
    
	private Integer id ;  // instead of int
	private Integer shop_id ;  // instead of long
	private Integer category_id ;
    private String product_name;
    private String product_slug;
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

	private String description;
    private Double price ;
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

	private String image_url;
    private Double original_price;
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

	public Double getWeight() {
		return weight;
	}

	public void setWeight(Double weight) {
		this.weight = weight;
	}

	public Double getLength() {
		return length;
	}

	public void setLength(Double length) {
		this.length = length;
	}

	public Double getWidth() {
		return width;
	}

	public void setWidth(Double width) {
		this.width = width;
	}

	public Double getHeight() {
		return height;
	}

	public void setHeight(Double height) {
		this.height = height;
	}

	public String getBrand() {
		return brand;
	}

	public void setBrand(String brand) {
		this.brand = brand;
	}

	public Integer getIs_active() {
		return is_active;
	}

	public void setIs_active(Integer is_active) {
		this.is_active = is_active;
	}

	private Integer stock_quantity = null;
    private Integer sold_count = null;
    private Double rating;
    private Integer review_count=null;
    private Double weight;
    private Double length;
    private Double width;
    private Double height;
    private String brand;
    
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

	private List<ProductImage> images;
	
    private Integer is_active=1;
    private String reject_reason;
    private LocalDateTime hiddenAt;
    private Long hiddenBy;
    private String hiddenReason;
    private String hiddenByRole;
    private String shop_name; // joined from shop table for listing

    public String getShop_name() { return shop_name; }
    public void setShop_name(String shop_name) { this.shop_name = shop_name; }

    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public String getReject_reason() {
        return reject_reason;
    }

    public void setReject_reason(String reject_reason) {
        this.reject_reason = reject_reason;
    }

    public LocalDateTime getHiddenAt() {
        return hiddenAt;
    }

    public void setHiddenAt(LocalDateTime hiddenAt) {
        this.hiddenAt = hiddenAt;
    }

    public Long getHiddenBy() {
        return hiddenBy;
    }

    public void setHiddenBy(Long hiddenBy) {
        this.hiddenBy = hiddenBy;
    }

    public String getHiddenReason() {
        return hiddenReason;
    }

    public void setHiddenReason(String hiddenReason) {
        this.hiddenReason = hiddenReason;
    }

    public String getHiddenByRole() {
        return hiddenByRole;
    }

    public void setHiddenByRole(String hiddenByRole) {
        this.hiddenByRole = hiddenByRole;
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

    public Product(Integer id, Integer shop_id, Integer category_id, String product_name,
                   String product_slug, String description, Double price, Double original_price,
                   Integer stock_quantity, Integer sold_count, Double rating, Integer review_count,
                   Double weight, Double length, Double width, Double height,
                   String brand, Integer is_active, LocalDateTime created_at, LocalDateTime updated_at) {
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
        this.brand = brand;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }


    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", shop_id=" + shop_id +
                ", category_id=" + category_id +
                ", product_name='" + product_name + '\'' +
                ", product_slug='" + product_slug + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", original_price=" + original_price +
                ", stock_quantity=" + stock_quantity +
                ", sold_count=" + sold_count +
                ", rating=" + rating +
                ", review_count=" + review_count +
                ", weight=" + weight +
                ", length=" + length +
                ", width=" + width +
                ", height=" + height +
                ", brand='" + brand + '\'' +
                ", is_active=" + is_active +
                ", hiddenAt=" + hiddenAt +
                ", hiddenBy=" + hiddenBy +
                ", hiddenReason='" + hiddenReason + '\'' +
                ", hiddenByRole='" + hiddenByRole + '\'' +
                ", created_at=" + created_at +
                ", updated_at=" + updated_at +
                '}';
    }
}
