package docker_test.com.dto;

import java.util.List;

public record CreateAdjustmentRequestDTO(
        String shopReason,
        List<AdjustmentItemDTO> items
) {
    public record AdjustmentItemDTO(
            Long orderItemId,
            Integer newQuantity
    ) {
    }
}
