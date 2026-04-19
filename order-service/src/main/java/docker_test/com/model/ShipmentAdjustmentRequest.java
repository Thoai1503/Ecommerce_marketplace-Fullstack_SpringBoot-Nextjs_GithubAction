package docker_test.com.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shipment_adjustment_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentAdjustmentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_code", nullable = false)
    private String requestCode;

    @Column(name = "order_shipment_id", nullable = false)
    private Long orderShipmentId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "shop_id", nullable = false)
    private Long shopId;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "shop_reason")
    private String shopReason;

    @Column(name = "buyer_note")
    private String buyerNote;

    @Column(name = "total_original_amount", nullable = false)
    private Double totalOriginalAmount;

    @Column(name = "total_adjusted_amount", nullable = false)
    private Double totalAdjustedAmount;

    @Column(name = "total_diff_amount", nullable = false)
    private Double totalDiffAmount;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
