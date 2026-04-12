package docker_test.com.dto;

import java.util.List;

public record OrderShipmentByShopResponseDTO(
        Long shipmentId,
        Long orderId,
        Long shopId,
        Long shippingFee,
        Long totalAmount,
        String carrierName,
        String trackingNumber,
        String shippingStatus,
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
            Double totalPrice
    ) {
    }
}