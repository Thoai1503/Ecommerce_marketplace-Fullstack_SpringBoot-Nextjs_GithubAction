package payment_service.com.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentStatusHistoryResponse {
    private Long id;
    private Long transactionId;
    private String fromStatus;
    private String toStatus;
    private String changedBy;
    private Long actorId;
    private String reason;
    private JsonNode gatewayData;
    private LocalDateTime createdAt;
}
