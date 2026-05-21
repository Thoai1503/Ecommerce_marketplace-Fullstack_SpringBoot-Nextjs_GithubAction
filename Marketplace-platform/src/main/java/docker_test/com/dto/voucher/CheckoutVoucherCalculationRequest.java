package docker_test.com.dto.voucher;

import java.util.List;
import java.util.Map;

public class CheckoutVoucherCalculationRequest {
    private Long userId;
    private Boolean hasPreviousOrder;
    private List<Item> items;
    private Map<String, List<Long>> selectedShopVoucherIdsByShop;
    private List<Long> selectedPlatformVoucherIds;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Boolean getHasPreviousOrder() {
        return hasPreviousOrder;
    }

    public void setHasPreviousOrder(Boolean hasPreviousOrder) {
        this.hasPreviousOrder = hasPreviousOrder;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public Map<String, List<Long>> getSelectedShopVoucherIdsByShop() {
        return selectedShopVoucherIdsByShop;
    }

    public void setSelectedShopVoucherIdsByShop(Map<String, List<Long>> selectedShopVoucherIdsByShop) {
        this.selectedShopVoucherIdsByShop = selectedShopVoucherIdsByShop;
    }

    public List<Long> getSelectedPlatformVoucherIds() {
        return selectedPlatformVoucherIds;
    }

    public void setSelectedPlatformVoucherIds(List<Long> selectedPlatformVoucherIds) {
        this.selectedPlatformVoucherIds = selectedPlatformVoucherIds;
    }

    public static class Item {
        private String itemKey;
        private Long shopId;
        private Long productId;
        private Long variantId;
        private Long categoryId;
        private Long brandId;
        private Integer quantity;
        private Double price;

        public String getItemKey() {
            return itemKey;
        }

        public void setItemKey(String itemKey) {
            this.itemKey = itemKey;
        }

        public Long getShopId() {
            return shopId;
        }

        public void setShopId(Long shopId) {
            this.shopId = shopId;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Long getVariantId() {
            return variantId;
        }

        public void setVariantId(Long variantId) {
            this.variantId = variantId;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public Long getBrandId() {
            return brandId;
        }

        public void setBrandId(Long brandId) {
            this.brandId = brandId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }
    }
}
