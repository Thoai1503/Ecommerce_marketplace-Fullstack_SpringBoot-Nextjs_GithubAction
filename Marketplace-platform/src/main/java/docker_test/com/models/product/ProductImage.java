package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductImage {
 
	private Integer id;
    public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	private Integer product_id;
    private String image_url;
    private int display_order;
    private int is_thumbnail;
    private LocalDateTime created_at;

    public ProductImage() {
        this.display_order = 0;
        this.is_thumbnail = 0;
        this.created_at = LocalDateTime.now();
    }

    public ProductImage( Integer product_id, String image_url, 
                       int display_order, int is_thumbnail, LocalDateTime created_at) {

        this.product_id = product_id;
        this.image_url = image_url;
        this.display_order = display_order;
        this.is_thumbnail = is_thumbnail;
        this.created_at = created_at;
    }


    public Integer getProductId() {
        return product_id;
    }

    public void setProductId(Integer product_id) {
        this.product_id = product_id;
    }

    public String getImageUrl() {
        return image_url;
    }

    public void setImageUrl(String image_url) {
        this.image_url = image_url;
    }

    public int getDisplayOrder() {
        return display_order;
    }

    public void setDisplayOrder(int display_order) {
        this.display_order = display_order;
    }

    public int isThumbnail() {
        return is_thumbnail;
    }

    public void setThumbnail(int is_thumbnail) {
        this.is_thumbnail = is_thumbnail;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}