package docker_test.com.dto;

public record CancelShipmentByOosResponseDTO(
        Long shipmentId,
        Long orderId,
        String shippingStatus,
        String businessStatus,
        String message
) {
}
