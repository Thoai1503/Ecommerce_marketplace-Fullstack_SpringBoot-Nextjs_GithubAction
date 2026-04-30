package logistic_service.com.dto;

import java.util.List;

public record CalculateFeeRequest(
        Integer from_district_id,
        String from_ward_code,
        Integer service_id,
        Integer service_type_id,
        Integer to_district_id,
        String to_ward_code,
        Integer height,
        Integer length,
        Integer weight,
        Integer width,
        Integer insurance_value,
        Integer cod_failed_amount,
        String coupon,
        List<CalculateFeeItemRequest> items
) {
}
