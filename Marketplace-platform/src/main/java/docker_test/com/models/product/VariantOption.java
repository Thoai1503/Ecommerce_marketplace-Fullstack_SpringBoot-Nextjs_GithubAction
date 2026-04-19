package docker_test.com.models.product;

import java.time.LocalDateTime;

public class VariantOption {
    private Long id;
    private Long variant_group_id;
    private String option_value;
    private Integer sort_order;
    private String image_url;
    private Integer is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public VariantOption() {
        this.sort_order = 1;
        this.is_active = 1;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVariant_group_id() {
        return variant_group_id;
    }

    public void setVariant_group_id(Long variant_group_id) {
        this.variant_group_id = variant_group_id;
    }

    public String getOption_value() {
        return option_value;
    }

    public void setOption_value(String option_value) {
        this.option_value = option_value;
    }

    public Integer getSort_order() {
        return sort_order;
    }

    public void setSort_order(Integer sort_order) {
        this.sort_order = sort_order;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }

    public Integer getIs_active() {
        return is_active;
    }

    public void setIs_active(Integer is_active) {
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
}
