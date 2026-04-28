package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payment_dispute", indexes = {
    @Index(name = "uk_dispute_code", columnList = "dispute_code", unique = true),
    @Index(name = "idx_dispute_txn", columnList = "transaction_id"),
    @Index(name = "idx_dispute_order", columnList = "order_id"),
    @Index(name = "idx_dispute_user", columnList = "user_id,status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDispute {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 64, unique = true)
    private String disputeCode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private PaymentTransaction transaction;
    
    @Column(nullable = false)
    private Long orderId;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column
    private Long shopId;
    
    @Column(nullable = false, length = 30)
    private String disputeType;  // CHARGEBACK, NOT_RECEIVED, ITEM_DEFECTIVE, FRAUD, DUPLICATE_CHARGE
    
    @Column(nullable = false)
    private Long disputeAmount;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode evidenceUrls;
    
    @Column(nullable = false, length = 20)
    private String status;  // OPEN, UNDER_REVIEW, RESOLVED_BUYER, RESOLVED_SELLER, CLOSED
    
    @Column(columnDefinition = "TEXT")
    private String resolutionNote;
    
    @Column
    private Long resolvedBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime openedAt;
    
    @Column
    private LocalDateTime resolvedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        openedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
