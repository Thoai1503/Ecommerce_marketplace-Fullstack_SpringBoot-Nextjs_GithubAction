package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "refund_request", indexes = {
    @Index(name = "uk_refund_code", columnList = "refund_code", unique = true),
    @Index(name = "idx_refund_transaction", columnList = "transaction_id"),
    @Index(name = "idx_refund_order", columnList = "order_id"),
    @Index(name = "idx_refund_user", columnList = "user_id,status"),
    @Index(name = "idx_refund_status_created", columnList = "status,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 64, unique = true)
    private String refundCode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private PaymentTransaction transaction;
    
    @Column(nullable = false)
    private Long orderId;
    
    @Column(nullable = false, length = 64)
    private String orderNumber;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column
    private Long shopId;
    
    @Column(nullable = false)
    private Long refundAmount;  // VND
    
    @Column(nullable = false)
    private Long shippingRefund;  // Phí ship hoàn lại
    
    @Column(length = 3, nullable = false, columnDefinition = "CHAR(3)")
    private String currency;
    
    @Column(nullable = false, length = 30)
    private String refundType;  // CANCELLED_BY_USER, CANCELLED_BY_SHOP, ITEM_NOT_RECEIVED, ITEM_DEFECTIVE, OVERPAID, SYSTEM_ERROR, DUPLICATE_PAYMENT
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode evidenceUrls;
    
    @Column(nullable = false, length = 30)
    private String refundMethod;  // ORIGINAL_METHOD, WALLET, BANK_TRANSFER
    
    @Column(length = 100)
    private String bankAccountName;
    
    @Column(length = 30)
    private String bankAccountNumber;
    
    @Column(length = 20)
    private String bankCode;
    
    @Column(length = 128)
    private String gatewayRefundId;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode gatewayResponse;
    
    @Column(nullable = false, length = 20)
    private String status;  // REQUESTED, APPROVED, REJECTED, PROCESSING, COMPLETED, FAILED
    
    @Column
    private Long reviewedBy;
    
    @Column(length = 500)
    private String reviewNote;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;
    
    @Column
    private LocalDateTime approvedAt;
    
    @Column
    private LocalDateTime completedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        requestedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
