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
    private Integer display_order;
    private Integer is_thumbnail;
    private LocalDateTime created_at;

    public ProductImage() {
        this.display_order = 0;
        this.is_thumbnail = 0;
        this.created_at = LocalDateTime.now();
    }

    public ProductImage( Integer product_id, String image_url, 
                       Integer display_order, Integer is_thumbnail, LocalDateTime created_at) {

        this.product_id = product_id;
        this.image_url = image_url;
        this.display_order = display_order;
        this.is_thumbnail = is_thumbnail;
        this.created_at = created_at;
    }


    public Integer getProduct_id() {
        return product_id;
    }

    public void setProductId(Integer product_id) {
        this.product_id = product_id;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImageUrl(String image_url) {
        this.image_url = image_url;
    }

    public Integer getDisplay_order() {
        return display_order;
    }

    public void setDisplayOrder(Integer display_order) {
        this.display_order = display_order;
    }

    public Integer getIs_thumbnail() {
        return is_thumbnail;
    }

    public void setThumbnail(Integer is_thumbnail) {
        this.is_thumbnail = is_thumbnail;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}