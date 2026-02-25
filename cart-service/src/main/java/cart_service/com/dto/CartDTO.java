package cart_service.com.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class CartDTO {
	   @JsonProperty("id")
    private Long id;
	   @JsonProperty("user_id")
	    private Long userId;

	    @NotNull
	    @JsonProperty("product_id")
	    private Long productId;

	    @JsonProperty("variant_id")
	    private Long variantId;

	    @NotNull
	    @Min(1)
	    private Integer quantity;
}
