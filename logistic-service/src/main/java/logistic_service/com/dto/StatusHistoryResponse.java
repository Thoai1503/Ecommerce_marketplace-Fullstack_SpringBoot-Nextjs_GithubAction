package logistic_service.com.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for shipment status history creation
 * Confirms successful creation and timezone synchronization
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatusHistoryResponse {
    private Long id;
    private Long shipmentId;
    private String status;
    private String description;
    private String message;
}
