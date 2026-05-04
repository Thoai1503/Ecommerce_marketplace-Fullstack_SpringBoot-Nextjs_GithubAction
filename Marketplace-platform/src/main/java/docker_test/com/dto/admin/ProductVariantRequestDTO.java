package docker_test.com.dto.admin;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProductVariantRequestDTO {
    @NotBlank(message = "T\u00ean bi\u1ebfn th\u1ec3 l\u00e0 b\u1eaft bu\u1ed9c")
    @Size(min = 1, max = 255, message = "T\u00ean bi\u1ebfn th\u1ec3 t\u1ed1i \u0111a 255 k\u00fd t\u1ef1")
    private String variant_name;

    @NotBlank(message = "SKU l\u00e0 b\u1eaft bu\u1ed9c")
    @Size(min = 1, max = 100, message = "SKU t\u1ed1i \u0111a 100 k\u00fd t\u1ef1")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "SKU ch\u1ec9 ch\u1ee9a ch\u1eef, s\u1ed1, g\u1ea1ch ngang, g\u1ea1ch d\u01b0\u1edbi")
    private String sku;

    @NotNull(message = "Gi\u00e1 l\u00e0 b\u1eaft bu\u1ed9c")
    @DecimalMin(value = "0.01", message = "Gi\u00e1 ph\u1ea3i l\u1edbn h\u01a1n 0")
    @DecimalMax(value = "999999999.0", message = "Gi\u00e1 t\u1ed1i \u0111a 999.999.999\u0111")
    private BigDecimal price;

    @NotNull(message = "T\u1ed3n kho l\u00e0 b\u1eaft bu\u1ed9c")
    @Min(value = 0, message = "T\u1ed3n kho kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m")
    @Max(value = 1_000_000, message = "T\u1ed3n kho t\u1ed1i \u0111a 1.000.000")
    private Integer stock_quantity;

    @Size(max = 500, message = "URL \u1ea3nh t\u1ed1i \u0111a 500 k\u00fd t\u1ef1")
    private String image_url;

    @Min(0)
    private Long weight;

    @Min(0)
    private Long length;

    @Min(0)
    private Long width;

    @Min(0)
    private Long height;

    public String getVariant_name() {
        return variant_name;
    }

    public void setVariant_name(String variant_name) {
        this.variant_name = variant_name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock_quantity() {
        return stock_quantity;
    }

    public void setStock_quantity(Integer stock_quantity) {
        this.stock_quantity = stock_quantity;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }

    public Long getWeight() {
        return weight;
    }

    public void setWeight(Long weight) {
        this.weight = weight;
    }

    public Long getLength() {
        return length;
    }

    public void setLength(Long length) {
        this.length = length;
    }

    public Long getWidth() {
        return width;
    }

    public void setWidth(Long width) {
        this.width = width;
    }

    public Long getHeight() {
        return height;
    }

    public void setHeight(Long height) {
        this.height = height;
    }
}
