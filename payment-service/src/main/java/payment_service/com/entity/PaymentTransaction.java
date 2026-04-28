package payment_service.com.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payment_transaction", indexes = {
    @Index(name = "uk_txn_code", columnList = "txn_code", unique = true),
    @Index(name = "uk_order_id", columnList = "order_id", unique = true),
    @Index(name = "idx_txn_type_status", columnList = "txn_type,status,created_at"),
    @Index(name = "idx_ref", columnList = "ref_type,ref_id"),
    @Index(name = "idx_payer", columnList = "payer_type,payer_id"),
    @Index(name = "idx_payee", columnList = "payee_type,payee_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_order_number", columnList = "order_number"),
    @Index(name = "idx_gateway_txn_id", columnList = "gateway_txn_id"),
    @Index(name = "idx_status_created", columnList = "status,created_at"),
    @Index(name = "idx_completed_at", columnList = "completed_at"),
    @Index(name = "idx_expired_at", columnList = "expired_at,status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 64, unique = true)
    private String txnCode;  // Mã giao dịch nội bộ
    
    @Column(nullable = false, length = 30)
    private String txnType;  // ORDER_PAYMENT, WALLET_TOPUP, WALLET_WITHDRAW, SETTLEMENT_PAYOUT, REFUND_PAYOUT, PLATFORM_FEE, ADJUSTMENT
    
    @Column(length = 30)
    private String refType;  // ORDER, TOPUP, SETTLEMENT, REFUND, DISPUTE, ADJUSTMENT
    
    @Column
    private Long refId;
    
    @Column(length = 64)
    private String refCode;
    
    @Column(length = 20)
    private String payerType;  // USER, SHOP, PLATFORM
    
    @Column
    private Long payerId;
    
    @Column(length = 20)
    private String payeeType;  // USER, SHOP, PLATFORM
    
    @Column
    private Long payeeId;
    
    @Column
    private Long orderId;
    
    @Column(length = 64)
    private String orderNumber;
    
    @Column
    private Long userId;
    
    @Column(nullable = false)
    private Long grossAmount;  // Tổng giá trị giao dịch trước khi trừ (VND)
    
    @Column(nullable = false)
    private Long feeAmount;  // Phí giao dịch / phí nền tảng
    
    @Column(nullable = false)
    private Long discountAmount;  // Giảm giá / voucher
    
    @Column(nullable = false)
    private Long netAmount;  // gross - fee - discount
    
    @Column(length = 3, nullable = false, columnDefinition = "CHAR(3)")
    private String currency;  // VND
    
    @Column(length = 30)
    private String paymentMethod;  // COD, VNPAY, MOMO, ZALOPAY, BANK_TRANSFER, CREDIT_CARD, WALLET, INSTALLMENT, INTERNAL
    
    @Column(length = 30)
    private String gatewayCode;  // VNPAY, MOMO, ZALOPAY, STRIPE, KREDIVO (NULL = INTERNAL)
    
    @Column(length = 128)
    private String gatewayTxnId;  // Mã giao dịch từ cổng thanh toán (NULL = INTERNAL)
    
    @Column(length = 128)
    private String gatewayOrderId;  // Mã đơn hàng từ cổng thanh toán (NULL = INTERNAL)
    
    @Column(length = 128)
    private String gatewayRefCode; // Mã tham chiếu từ cổng thanh toán (NULL = INTERNAL)
    
    @Column(length = 20)
    private String gatewayResponseCode; // Mã phản hồi từ cổng thanh toán (NULL = INTERNAL)
    
    @Column(length = 255)
    private String gatewayResponseMsg; // Thông điệp phản hồi từ cổng thanh toán (NULL = INTERNAL)
    
    @Column(columnDefinition = "TEXT")
    private String paymentUrl;  // URL thanh toán (nếu có, thường dùng cho các cổng thanh toán redirect)
    
    @Column(length = 20)
    private String bankCode;  // BIDV, VCB, TCB...
    
    @Column(length = 100)
    private String bankAccountName;
    
    @Column(length = 30)
    private String bankAccountNumber;
    
    @Column(length = 20)
    private String cardType;  // ATM, CREDIT, DEBIT
    
    @Column(nullable = false, length = 20)
    private String status;  // PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, EXPIRED, REFUNDED
    
    @Column(length = 255)
    private String failureReason;
    
    @Column
    private LocalDateTime expiredAt;
    
    @Column
    private LocalDateTime completedAt;
    
    @Column
    private LocalDateTime confirmedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(length = 20)
    private String initiatedBy;  // USER, ADMIN, SYSTEM, SCHEDULER
    
    @Column
    private Long initiatorId;
    
    @Column(length = 45)
    private String ipAddress;
    
    @Column(length = 500)
    private String userAgent;
    
    @Column(length = 20)
    private String deviceType;  // APP, WEB, MOBILE_WEB
    
    @Column(length = 500)
    private String note;
    
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode extraData;
    
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
