package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_settlement", indexes = {
    @Index(name = "uk_settlement_code", columnList = "settlement_code", unique = true),
    @Index(name = "idx_settlement_shop", columnList = "shop_id,status"),
    @Index(name = "idx_settlement_period", columnList = "period_from,period_to"),
    @Index(name = "idx_settlement_status", columnList = "status,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerSettlement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 64, unique = true)
    private String settlementCode;
    
    @Column(nullable = false)
    private Long shopId;
    
    @Column(nullable = false)
    private LocalDate periodFrom;
    
    @Column(nullable = false)
    private LocalDate periodTo;
    
    @Column(nullable = false)
    private Long grossAmount;  // Tổng doanh thu chưa trừ phí
    
    @Column(nullable = false)
    private Long platformFee;
    
    @Column(nullable = false)
    private Long shippingSubsidy;
    
    @Column(nullable = false)
    private Long voucherCost;
    
    @Column(nullable = false)
    private Long adjustmentAmount;  // Có thể âm
    
    @Column(nullable = false)
    private Long netAmount;  // gross - fee - voucher + subsidy + adjustment
    
    @Column(length = 3, nullable = false, columnDefinition = "CHAR(3)")
    private String currency;
    
    @Column(length = 100)
    private String bankAccountName;
    
    @Column(length = 30)
    private String bankAccountNumber;
    
    @Column(length = 20)
    private String bankCode;
    
    @Column(nullable = false, length = 20)
    private String status;  // PENDING, PROCESSING, PAID, ON_HOLD, CANCELLED
    
    @Column(length = 500)
    private String onHoldReason;
    
    @Column
    private LocalDateTime paidAt;
    
    @Column(length = 128)
    private String bankTransferRef;
    
    @Column
    private Long processedBy;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
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
