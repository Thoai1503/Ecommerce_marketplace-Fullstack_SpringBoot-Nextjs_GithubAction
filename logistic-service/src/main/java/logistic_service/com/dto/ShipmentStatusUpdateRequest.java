package logistic_service.com.dto;

import logistic_service.com.enums.ShipmentStatus;

public record ShipmentStatusUpdateRequest(Long orderShipmentRefId, ShipmentStatus status) {
}
