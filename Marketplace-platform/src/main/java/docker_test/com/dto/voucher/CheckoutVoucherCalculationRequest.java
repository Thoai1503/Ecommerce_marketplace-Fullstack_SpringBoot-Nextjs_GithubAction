package docker_test.com.dto.voucher;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class CheckoutVoucherCalculationRequest {
    private Long userId;
    private Boolean hasPreviousOrder;
    private List<Item> items;
    private Map<String, List<Long>> selectedShopVoucherIdsByShop;
    private List<Long> selectedPlatformVoucherIds;

    @Data
    public static class Item {
        private String itemKey;
        private Long shopId;
        private Long productId;
        private Long variantId;
        private Long categoryId;
        private Long brandId;
        private Integer quantity;
        private Double price;
    }
}
