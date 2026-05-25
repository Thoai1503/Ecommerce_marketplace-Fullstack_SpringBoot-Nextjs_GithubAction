package docker_test.com.models.wallet;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "wallet_transaction",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_wallet_txn_no", columnNames = "transaction_no"),
                @UniqueConstraint(name = "uq_wallet_idempotency", columnNames = "idempotency_key")
        },
        indexes = {
                @Index(name = "idx_wt_wallet_created", columnList = "wallet_id, created_at"),
                @Index(name = "idx_wt_source", columnList = "source_type, source_id"),
                @Index(name = "idx_wt_status_type_created", columnList = "status, transaction_type, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private UserWallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "counterparty_wallet_id")
    private UserWallet counterpartyWallet;

    @Column(name = "transaction_no", nullable = false, length = 50)
    private String transactionNo;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false)
    private WalletDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private WalletTransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private WalletSourceType sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "fee_amount", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @Column(name = "balance_before", nullable = false, precision = 18, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", nullable = false, precision = 18, scale = 2)
    private BigDecimal balanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private WalletTransactionStatus status = WalletTransactionStatus.COMPLETED;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "metadata", columnDefinition = "json")
    private String metadata;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        amount = normalize(amount);
        feeAmount = normalize(feeAmount);
        balanceBefore = normalize(balanceBefore);
        balanceAfter = normalize(balanceAfter);
        if (status == null) {
            status = WalletTransactionStatus.COMPLETED;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
        amount = normalize(amount);
        feeAmount = normalize(feeAmount);
        balanceBefore = normalize(balanceBefore);
        balanceAfter = normalize(balanceAfter);
    }

    private BigDecimal normalize(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
