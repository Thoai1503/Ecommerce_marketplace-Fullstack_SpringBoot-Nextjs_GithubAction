package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_settlement_item", indexes = {
    @Index(name = "idx_settlement_item_set", columnList = "settlement_id"),
    @Index(name = "idx_settlement_item_txn", columnList = "transaction_id"),
    @Index(name = "idx_settlement_item_order", columnList = "order_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerSettlementItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_id", nullable = false)
    private SellerSettlement settlement;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private PaymentTransaction transaction;
    
    @Column(nullable = false)
    private Long orderId;
    
    @Column(nullable = false, length = 64)
    private String orderNumber;
    
    @Column(nullable = false, length = 20)
    private String itemType;  // SALE, REFUND, ADJUSTMENT
    
    @Column(nullable = false)
    private Long grossAmount;
    
    @Column(nullable = false)
    private Long platformFee;
    
    @Column(nullable = false)
    private Long voucherCost;
    
    @Column(nullable = false)
    private Long netAmount;
    
    @Column
    private LocalDateTime orderPaidAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
