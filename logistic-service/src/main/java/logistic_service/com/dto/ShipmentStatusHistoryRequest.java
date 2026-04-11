package logistic_service.com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating shipment status history
 * Automatically syncs shipment.updated_at with latest status history timestamp
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentStatusHistoryRequest {
    private String status;
    private String description;
    private String location;
    private String updatedBy;
}
