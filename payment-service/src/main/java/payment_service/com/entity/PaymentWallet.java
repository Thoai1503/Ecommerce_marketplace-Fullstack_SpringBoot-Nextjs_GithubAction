package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_wallet", indexes = {
    @Index(name = "idx_wallet_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWallet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Long userId;
    
    @Column(nullable = false)
    private Long balance;  // Số dư khả dụng (VND)
    
    @Column(nullable = false)
    private Long lockedBalance;  // Số dư đang tạm giữ
    
    @Column(length = 3, nullable = false, columnDefinition = "CHAR(3)")
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "ENUM('ACTIVE','SUSPENDED','CLOSED') DEFAULT 'ACTIVE'")
    private PaymentWalletStatus status;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = PaymentWalletStatus.ACTIVE;
        }
        balance = 0L;
        lockedBalance = 0L;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}