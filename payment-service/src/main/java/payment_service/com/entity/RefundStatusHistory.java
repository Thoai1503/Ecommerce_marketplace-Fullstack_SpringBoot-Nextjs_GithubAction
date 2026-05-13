package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_status_history", indexes = {
    @Index(name = "idx_refund_status_history", columnList = "refund_id,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundStatusHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refund_id", nullable = false)
    private RefundRequest refund;
    
    @Column(length = 20)
    private String fromStatus;
    
    @Column(nullable = false, length = 20)
    private String toStatus;
    
    @Column(nullable = false, length = 50)
    private String changedBy;  // USER, ADMIN, SYSTEM, GATEWAY
    
    @Column
    private Long actorId;
    
    @Column(length = 500)
    private String note;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
