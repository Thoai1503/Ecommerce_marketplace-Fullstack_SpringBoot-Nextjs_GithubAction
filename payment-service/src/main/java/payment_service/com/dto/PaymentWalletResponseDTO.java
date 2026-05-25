package payment_service.com.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWalletResponseDTO {

    private Long id;
    private Long userId;
    private Long balance;
    private Long lockedBalance;
    private String currency;
    private Boolean isActive;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}