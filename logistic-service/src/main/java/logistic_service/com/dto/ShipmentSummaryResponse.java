package logistic_service.com.dto;

import java.time.LocalDateTime;

import logistic_service.com.enums.ShipmentStatus;

public record ShipmentSummaryResponse(
        Long id,
        String trackingCode,
        Long orderShipmentRefId,
        Long shopRefId,
        Long partnerId,
        Long recipientId,
        ShipmentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime estimatedDeliveryAt,
        LocalDateTime deliveredAt
) {
}
