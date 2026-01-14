package docker_test.com.models.product;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class ProductAttribute {
    private int id;
    private int product_id;
    private int attribute_id;
    private Integer attribute_value_id;
    private String value_text;
    private Double value_number;
    private LocalDate value_date;
    private Integer unit_id;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public ProductAttribute() {
        this.created_at = LocalDateTime.now();
    }

    public ProductAttribute(int id, int product_id, int attribute_id, Integer attribute_value_id, 
                           String value_text, Double value_number, LocalDate value_date, 
                           Integer unit_id, LocalDateTime created_at, LocalDateTime updated_at) {
        this.id = id;
        this.product_id = product_id;
        this.attribute_id = attribute_id;
        this.attribute_value_id = attribute_value_id;
        this.value_text = value_text;
        this.value_number = value_number;
        this.value_date = value_date;
        this.unit_id = unit_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProductId() {
        return product_id;
    }

    public void setProductId(int product_id) {
        this.product_id = product_id;
    }

    public int getAttributeId() {
        return attribute_id;
    }

    public void setAttributeId(int attribute_id) {
        this.attribute_id = attribute_id;
    }

    public Integer getAttributeValueId() {
        return attribute_value_id;
    }

    public void setAttributeValueId(Integer attribute_value_id) {
        this.attribute_value_id = attribute_value_id;
    }

    public String getValueText() {
        return value_text;
    }

    public void setValueText(String value_text) {
        this.value_text = value_text;
    }

    public Double getValueNumber() {
        return value_number;
    }

    public void setValueNumber(Double value_number) {
        this.value_number = value_number;
    }

    public LocalDate getValueDate() {
        return value_date;
    }

    public void setValueDate(LocalDate value_date) {
        this.value_date = value_date;
    }

    public Integer getUnitId() {
        return unit_id;
    }

    public void setUnitId(Integer unit_id) {
        this.unit_id = unit_id;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdatedAt() {
        return updated_at;
    }

    public void setUpdatedAt(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}