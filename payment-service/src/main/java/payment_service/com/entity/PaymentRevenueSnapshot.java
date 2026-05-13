package payment_service.com.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_revenue_snapshot", indexes = {
    @Index(name = "uk_revenue_snapshot_txn", columnList = "transaction_id", unique = true),
    @Index(name = "uk_revenue_snapshot_txn_code", columnList = "txn_code", unique = true),
    @Index(name = "idx_revenue_recognized_at", columnList = "recognized_at"),
    @Index(name = "idx_revenue_txn_type_time", columnList = "txn_type,recognized_at"),
    @Index(name = "idx_revenue_cumulative_net", columnList = "cumulative_net_amount")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRevenueSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long transactionId;

    @Column(nullable = false, length = 64)
    private String txnCode;

    @Column(nullable = false, length = 30)
    private String txnType;

    @Column(nullable = false, length = 3, columnDefinition = "CHAR(3)")
    private String currency;

    @Column(nullable = false)
    private LocalDateTime recognizedAt;

    @Column(nullable = false)
    private Long grossAmount;

    @Column(nullable = false)
    private Long discountAmount;

    @Column(nullable = false)
    private Long feeAmount;

    @Column(nullable = false)
    private Long netAmount;

    @Column(nullable = false)
    private Long cumulativeSuccessCount;

    @Column(nullable = false)
    private Long cumulativeGrossAmount;

    @Column(nullable = false)
    private Long cumulativeDiscountAmount;

    @Column(nullable = false)
    private Long cumulativeFeeAmount;

    @Column(nullable = false)
    private Long cumulativeNetAmount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}