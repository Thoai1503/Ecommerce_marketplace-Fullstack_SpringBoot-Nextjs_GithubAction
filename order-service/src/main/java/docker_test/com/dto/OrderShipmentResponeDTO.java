package docker_test.com.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderShipmentResponeDTO(
		    Long shipmentId,
	        Long orderId,
	        Long shopId,
	        String shopName,
	        Long shippingFee,
	        Long totalAmount,
	        Long subtotal,
	        Long totalAfterDiscount,
	        Long lastReturnRequestId,
	        String carrierName,
	        String trackingNumber,
	        String shippingStatus,
	        String businessStatus,
	        Boolean adjustmentRequired,
	        Long latestAdjustmentRequestId,
	        String returnStatusSummary,
	        OrderInfoDTO order,
	        RecipientInfoDTO recipient,
	        List<OrderItemInfoDTO> items,
	        List<ShipmentStatusLogDTO> statusHistory
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

	    public record ShipmentStatusLogDTO(
	            Long id,
	            String status,
	            String note,
	            LocalDateTime changedAt,
	            String changedBy
	    ) {
	    }

}
