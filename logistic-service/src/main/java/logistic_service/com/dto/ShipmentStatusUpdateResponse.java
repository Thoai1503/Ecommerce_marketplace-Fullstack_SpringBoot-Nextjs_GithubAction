package logistic_service.com.dto;

import logistic_service.com.enums.ShipmentStatus;

public record ShipmentStatusUpdateResponse(
        Long id,
        Long orderShipmentRefId,
        String trackingCode,
        ShipmentStatus status,
        String message
) {
}
