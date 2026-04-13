package docker_test.com.models;

import java.time.LocalDateTime;

public class Category {

    private Integer id;
    private Integer parent_id;
    private String category_name;
    private String category_slug;
    private String category_icon;
    private Integer level;
    private Integer is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Category() {
    }

    public Category(Integer id, Integer parent_id, String category_name, String category_slug,
                    String category_icon, Integer level, Integer is_active,
                    LocalDateTime created_at, LocalDateTime updated_at) {
        this.id = id;
        this.parent_id = parent_id;
        this.category_name = category_name;
        this.category_slug = category_slug;
        this.category_icon = category_icon;
        this.level = level;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getParent_id() {
        return parent_id;
    }

    public void setParent_id(Integer parent_id) {
        this.parent_id = parent_id;
    }

    public String getCategory_name() {
        return category_name;
    }

    public void setCategory_name(String category_name) {
        this.category_name = category_name;
    }

    public String getCategory_slug() {
        return category_slug;
    }

    public void setCategory_slug(String category_slug) {
        this.category_slug = category_slug;
    }

    public String getCategory_icon() {
        return category_icon;
    }

    public void setCategory_icon(String category_icon) {
        this.category_icon = category_icon;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
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