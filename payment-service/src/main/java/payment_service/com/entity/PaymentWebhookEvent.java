package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_webhook_event", indexes = {
    @Index(name = "uk_gateway_event", columnList = "gateway_code,event_id", unique = true),
    @Index(name = "idx_webhook_processed", columnList = "is_processed,received_at"),
    @Index(name = "idx_webhook_txn", columnList = "transaction_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWebhookEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 30)
    private String gatewayCode;
    
    @Column(length = 128)
    private String eventId;  // ID do gateway cấp — idempotency key
    
    @Column(length = 50)
    private String eventType;  // payment.success, payment.failed, refund.completed...
    
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String rawPayload;
    
    @Column(length = 512)
    private String signature;  // HMAC/RSA signature
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isVerified;
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isProcessed;
    
    @Column(length = 50)
    private String processResult;  // SUCCESS, FAILED, IGNORED, DUPLICATE
    
    @Column
    private Long transactionId;
    
    @Column(length = 500)
    private String processNote;
    
    @Column(nullable = false)
    private Integer retryCount;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime receivedAt;
    
    @Column
    private LocalDateTime processedAt;
    
    @PrePersist
    protected void onCreate() {
        receivedAt = LocalDateTime.now();
        isVerified = false;
        isProcessed = false;
        retryCount = 0;
    }
}
