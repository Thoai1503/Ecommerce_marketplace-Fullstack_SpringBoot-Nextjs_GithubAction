package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payment_gateway_log", indexes = {
    @Index(name = "idx_gateway_log_txn", columnList = "transaction_id"),
    @Index(name = "idx_gateway_log_type", columnList = "gateway_code,log_type,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentGatewayLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private PaymentTransaction transaction;
    
    @Column(nullable = false, length = 30)
    private String gatewayCode;
    
    @Column(nullable = false, length = 20)
    private String logType;  // REQUEST, RESPONSE, WEBHOOK, CALLBACK, IPN
    
    @Column(nullable = false, length = 10)
    private String direction;  // OUTBOUND, INBOUND
    
    @Column(length = 500)
    private String endpoint;
    
    @Column(length = 10)
    private String httpMethod;
    
    @Column
    private Integer httpStatus;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode requestHeaders;
    
    @Column(columnDefinition = "LONGTEXT")
    private String requestBody;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode responseHeaders;
    
    @Column(columnDefinition = "LONGTEXT")
    private String responseBody;
    
    @Column
    private Integer durationMs;
    
    @Column
    private Boolean isSuccess;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
