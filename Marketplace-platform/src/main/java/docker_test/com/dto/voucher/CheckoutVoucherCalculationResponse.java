package docker_test.com.dto.voucher;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class CheckoutVoucherCalculationResponse {
    private List<ItemBreakdown> items = new ArrayList<>();
    private Map<Long, Double> shopVoucherDiscountByShop = new LinkedHashMap<>();
    private Double shopVoucherDiscount = 0.0;
    private Double platformVoucherDiscount = 0.0;
    private Double totalVoucherDiscount = 0.0;
    private List<VoucherApplication> voucherApplications = new ArrayList<>();

    public List<ItemBreakdown> getItems() {
        return items;
    }

    public void setItems(List<ItemBreakdown> items) {
        this.items = items;
    }

    public Map<Long, Double> getShopVoucherDiscountByShop() {
        return shopVoucherDiscountByShop;
    }

    public void setShopVoucherDiscountByShop(Map<Long, Double> shopVoucherDiscountByShop) {
        this.shopVoucherDiscountByShop = shopVoucherDiscountByShop;
    }

    public Double getShopVoucherDiscount() {
        return shopVoucherDiscount;
    }

    public void setShopVoucherDiscount(Double shopVoucherDiscount) {
        this.shopVoucherDiscount = shopVoucherDiscount;
    }

    public Double getPlatformVoucherDiscount() {
        return platformVoucherDiscount;
    }

    public void setPlatformVoucherDiscount(Double platformVoucherDiscount) {
        this.platformVoucherDiscount = platformVoucherDiscount;
    }

    public Double getTotalVoucherDiscount() {
        return totalVoucherDiscount;
    }

    public void setTotalVoucherDiscount(Double totalVoucherDiscount) {
        this.totalVoucherDiscount = totalVoucherDiscount;
    }

    public List<VoucherApplication> getVoucherApplications() {
        return voucherApplications;
    }

    public void setVoucherApplications(List<VoucherApplication> voucherApplications) {
        this.voucherApplications = voucherApplications;
    }

    public static class ItemBreakdown {
        private String itemKey;
        private Long shopId;
        private Long productId;
        private Long variantId;
        private Double subtotal = 0.0;
        private Double shopVoucherDiscountAmount = 0.0;
        private Double platformVoucherDiscountAmount = 0.0;
        private Double totalVoucherDiscountAmount = 0.0;
        private Double totalAfterShopVoucher = 0.0;
        private Double totalAfterAllVouchers = 0.0;

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

        public Double getSubtotal() {
            return subtotal;
        }

        public void setSubtotal(Double subtotal) {
            this.subtotal = subtotal;
        }

        public Double getShopVoucherDiscountAmount() {
            return shopVoucherDiscountAmount;
        }

        public void setShopVoucherDiscountAmount(Double shopVoucherDiscountAmount) {
            this.shopVoucherDiscountAmount = shopVoucherDiscountAmount;
        }

        public Double getPlatformVoucherDiscountAmount() {
            return platformVoucherDiscountAmount;
        }

        public void setPlatformVoucherDiscountAmount(Double platformVoucherDiscountAmount) {
            this.platformVoucherDiscountAmount = platformVoucherDiscountAmount;
        }

        public Double getTotalVoucherDiscountAmount() {
            return totalVoucherDiscountAmount;
        }

        public void setTotalVoucherDiscountAmount(Double totalVoucherDiscountAmount) {
            this.totalVoucherDiscountAmount = totalVoucherDiscountAmount;
        }

        public Double getTotalAfterShopVoucher() {
            return totalAfterShopVoucher;
        }

        public void setTotalAfterShopVoucher(Double totalAfterShopVoucher) {
            this.totalAfterShopVoucher = totalAfterShopVoucher;
        }

        public Double getTotalAfterAllVouchers() {
            return totalAfterAllVouchers;
        }

        public void setTotalAfterAllVouchers(Double totalAfterAllVouchers) {
            this.totalAfterAllVouchers = totalAfterAllVouchers;
        }
    }

    public static class VoucherApplication {
        private Long voucherId;
        private Double discountAmount = 0.0;
        private List<ItemDiscount> itemDiscounts = new ArrayList<>();
        private Map<Long, Double> discountByShop = new LinkedHashMap<>();

        public Long getVoucherId() {
            return voucherId;
        }

        public void setVoucherId(Long voucherId) {
            this.voucherId = voucherId;
        }

        public Double getDiscountAmount() {
            return discountAmount;
        }

        public void setDiscountAmount(Double discountAmount) {
            this.discountAmount = discountAmount;
        }

        public List<ItemDiscount> getItemDiscounts() {
            return itemDiscounts;
        }

        public void setItemDiscounts(List<ItemDiscount> itemDiscounts) {
            this.itemDiscounts = itemDiscounts;
        }

        public Map<Long, Double> getDiscountByShop() {
            return discountByShop;
        }

        public void setDiscountByShop(Map<Long, Double> discountByShop) {
            this.discountByShop = discountByShop;
        }
    }

    public static class ItemDiscount {
        private String itemKey;
        private Double discountAmount = 0.0;

        public String getItemKey() {
            return itemKey;
        }

        public void setItemKey(String itemKey) {
            this.itemKey = itemKey;
        }

        public Double getDiscountAmount() {
            return discountAmount;
        }

        public void setDiscountAmount(Double discountAmount) {
            this.discountAmount = discountAmount;
        }
    }
}
