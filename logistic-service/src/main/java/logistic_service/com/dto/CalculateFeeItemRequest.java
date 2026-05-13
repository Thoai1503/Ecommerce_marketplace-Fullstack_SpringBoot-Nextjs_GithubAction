package logistic_service.com.dto;

public record CalculateFeeItemRequest(
        String name,
        Integer quantity,
        Integer height,
        Integer weight,
        Integer length,
        Integer width
) {
}
