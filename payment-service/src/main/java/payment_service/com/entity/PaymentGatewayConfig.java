package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payment_gateway_config", indexes = {
    @Index(name = "uk_gateway_code", columnList = "code", unique = true),
    @Index(name = "idx_gateway_active", columnList = "is_active,sort_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentGatewayConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 30, unique = true)
    private String code;  // COD, MOMO, VNPAY, ZALOPAY, BANK_TRANSFER, CREDIT_CARD, INSTALLMENT
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 50)
    private String provider;  // INTERNAL, MOMO, VNPAY, ZALOPAY, STRIPE, KREDIVO
    
    @Column(length = 500)
    private String logoUrl;
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean isActive;
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean isOnline;  // 0 = COD (offline), 1 = online payment
    
    @Column(nullable = false)
    private Long minAmount;  // VND
    
    @Column
    private Long maxAmount;  // NULL = no limit
    
    @Column(nullable = false)
    private Integer timeoutMinute;  // Default 15 phút
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode configJson;  // API key, merchant_id, endpoint (encrypted at app level)
    
    @Column(nullable = false)
    private Integer sortOrder;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
