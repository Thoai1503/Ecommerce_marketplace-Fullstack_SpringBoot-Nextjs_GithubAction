package logistic_service.com.dto;

import java.util.Optional;

import logistic_service.com.enums.ShipmentStatus;

public record ShipmentStatusUpdatedEvent(String trackingCode, ShipmentStatus status ,Optional<Long> shipmentId) {
}
