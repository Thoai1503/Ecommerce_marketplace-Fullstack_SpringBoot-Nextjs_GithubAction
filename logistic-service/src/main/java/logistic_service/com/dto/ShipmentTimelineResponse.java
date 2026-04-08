package logistic_service.com.dto;

import java.time.LocalDateTime;

import logistic_service.com.enums.ShipmentStatus;

public record ShipmentTimelineResponse(
        Long id,
        Long shipmentId,
        ShipmentStatus status,
        String description,
        String location,
        String updatedBy,
        LocalDateTime updatedAt
) {
}
