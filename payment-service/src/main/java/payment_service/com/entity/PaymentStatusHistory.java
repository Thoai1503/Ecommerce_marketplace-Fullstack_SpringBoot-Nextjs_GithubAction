package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payment_status_history", indexes = {
    @Index(name = "idx_txn_status_history", columnList = "transaction_id,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private PaymentTransaction transaction;
    
    @Column(length = 20)
    private String fromStatus;  // NULL = lần đầu tạo
    
    @Column(nullable = false, length = 20)
    private String toStatus;
    
    @Column(nullable = false, length = 50)
    private String changedBy;  // USER, SYSTEM, GATEWAY, ADMIN, WEBHOOK
    
    @Column
    private Long actorId;
    
    @Column(length = 255)
    private String reason;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode gatewayData;  // Snapshot dữ liệu gateway
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
