package docker_test.com.dto;

import java.time.LocalDateTime;
import java.util.List;

public record GetAdjustmentRequestDTO(
        Long id,
        String requestCode,
        Long orderShipmentId,
        Long orderId,
        Long shopId,
        String status,
        String shopReason,
        String buyerNote,
        Double totalOriginalAmount,
        Double totalAdjustedAmount,
        Double totalDiffAmount,
        LocalDateTime expiresAt,
        LocalDateTime respondedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<AdjustmentItemDTO> items
) {
    public record AdjustmentItemDTO(
            Long id,
            Long orderItemId,
            Long productId,
            Long variantId,
            String productName,
            String variantName,
            Integer oldQuantity,
            Integer newQuantity,
            Double unitPrice,
            Double oldTotal,
            Double newTotal,
            Double diffTotal
    ) {}
}
