package logistic_service.com.dto;

import logistic_service.com.enums.ShipmentStatus;

public record ShipmentStatusUpdatedEvent(String trackingCode, ShipmentStatus status) {
}
