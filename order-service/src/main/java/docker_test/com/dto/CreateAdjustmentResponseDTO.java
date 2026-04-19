package docker_test.com.dto;

public record CreateAdjustmentResponseDTO(
        Long adjustmentRequestId,
        String requestCode,
        String status,
        String message
) {
}
