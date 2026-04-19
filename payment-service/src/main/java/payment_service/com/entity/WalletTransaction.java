package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transaction", indexes = {
    @Index(name = "idx_wallet_txn_wallet", columnList = "wallet_id,created_at"),
    @Index(name = "idx_wallet_txn_user", columnList = "user_id,created_at"),
    @Index(name = "idx_wallet_txn_ref", columnList = "ref_type,ref_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private PaymentWallet wallet;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 30)
    private String txnType;  // CREDIT, DEBIT, LOCK, UNLOCK, REFUND_CREDIT, CASHBACK, EXPIRE, ADJUSTMENT
    
    @Column(nullable = false)
    private Long amount;  // Luôn dương
    
    @Column(nullable = false)
    private Long balanceBefore;
    
    @Column(nullable = false)
    private Long balanceAfter;
    
    @Column(length = 30)
    private String refType;  // PAYMENT, REFUND, PROMOTION, MANUAL
    
    @Column
    private Long refId;
    
    @Column(length = 255)
    private String description;
    
    @Column
    private LocalDateTime expiredAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
