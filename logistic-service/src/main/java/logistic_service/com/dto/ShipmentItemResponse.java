package logistic_service.com.dto;

public record ShipmentItemResponse(
        Long id,
        String productName,
        String sku,
        Integer quantity,
        Double price
) {
}
