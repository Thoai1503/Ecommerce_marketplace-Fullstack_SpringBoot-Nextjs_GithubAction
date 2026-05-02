package docker_test.com.dto;

public record CancelShipmentRequestDTO(
        Long userId,
        String reason
) {
}
