package docker_test.com.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OrderShipmentByShopResponseDTO(
        Long shipmentId,
        Long orderId,
        Long shopId,
        String shopName,
        Long shopUserId,
        Long shippingFee,
        Long totalAmount,
        Long subtotal,
        Long totalAfterVoucher,
        String carrierName,
        String trackingNumber,
        String shippingStatus,
        @JsonProperty("is_payout_settled") Boolean payoutSettled,
        Long lastReturnRequestId,
        OrderInfoDTO order,
        RecipientInfoDTO recipient,
        List<OrderItemInfoDTO> items
) {
    public record OrderInfoDTO(
            String orderNumber,
            Long userId,
            Long addressId,
            Double totalAmount,
            Long shippingFee,
            Long discountAmount,
            Long finalAmount,
            String paymentMethod,
            String paymentStatus,
            String orderStatus
    ) {
    }

    public record RecipientInfoDTO(
            String recipientName,
            String recipientPhone,
            String addressLine,
            String ward,
            String district,
            String city,
            String postalCode
    ) {
    }

    public record OrderItemInfoDTO(
            Long id,
            Long productId,
            Long variantId,
            String productName,
            String variantName,
            String image,
            Integer quantity,
            Double price,
            Double totalPrice,
            Double shopVoucherDiscountAmount,
            Double platformVoucherDiscountAmount,
            Double totalVoucherDiscountAmount,
            Double totalAfterShopVoucher,
            Double totalAfterAllVouchers,
            Double platformCommissionRate,
            Double platformCommissionAmount,
            Double sellerReceivableAmount
    ) {
    }
}
