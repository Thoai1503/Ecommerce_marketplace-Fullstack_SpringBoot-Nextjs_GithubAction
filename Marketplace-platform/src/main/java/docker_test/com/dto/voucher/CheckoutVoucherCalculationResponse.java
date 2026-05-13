package docker_test.com.dto.voucher;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class CheckoutVoucherCalculationResponse {
    private List<ItemBreakdown> items = new ArrayList<>();
    private Map<Long, Double> shopVoucherDiscountByShop = new LinkedHashMap<>();
    private Map<Long, Double> platformCommissionByShop = new LinkedHashMap<>();
    private Map<Long, Double> sellerReceivableByShop = new LinkedHashMap<>();
    private Double shopVoucherDiscount = 0.0;
    private Double platformVoucherDiscount = 0.0;
    private Double totalVoucherDiscount = 0.0;
    private Double platformCommissionAmount = 0.0;
    private Double sellerReceivableAmount = 0.0;
    private List<VoucherApplication> voucherApplications = new ArrayList<>();

    @Data
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
        private Double platformCommissionRate = 0.0;
        private Double platformCommissionAmount = 0.0;
        private Double sellerReceivableAmount = 0.0;
    }

    @Data
    public static class VoucherApplication {
        private Long voucherId;
        private Double discountAmount = 0.0;
        private List<ItemDiscount> itemDiscounts = new ArrayList<>();
        private Map<Long, Double> discountByShop = new LinkedHashMap<>();
    }

    @Data
    public static class ItemDiscount {
        private String itemKey;
        private Double discountAmount = 0.0;
    }
}
