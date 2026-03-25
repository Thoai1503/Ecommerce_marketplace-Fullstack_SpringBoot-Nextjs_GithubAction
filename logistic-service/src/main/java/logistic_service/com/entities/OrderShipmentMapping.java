package logistic_service.com.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * OrderShipmentMapping - Hỗ trợ multi-tracking.
 * 
 * Hỗ trợ trường hợp: 1 order ecommerce -> N vận đơn logistics
 * 
 * Bảng này thuộc logistics service, lưu mối quan hệ giữa:
 * - order_ref_id (từ ecommerce)
 * - shop_ref_id (từ ecommerce)
 * - shipment nội bộ logistics
 * 
 * Ecommerce service sẽ query endpoint của logistics để lấy danh sách
 * vận đơn liên quan đến 1 order. KHÔNG join DB chéo service.
 */
@Entity
@Table(
    name = "order_shipment_mapping",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_mapping_tracking",
        columnNames = "tracking_number"
    ),
    indexes = {
        @Index(name = "idx_mapping_order_ref",  columnList = "order_ref_id"),
        @Index(name = "idx_mapping_shop_ref",   columnList = "shop_ref_id"),
        @Index(name = "idx_mapping_shipment",   columnList = "shipment_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderShipmentMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * order_id bên ecommerce service.
     * Lưu String, KHÔNG phải FK, để tham chiếu lỏng (loose coupling).
     */
    @Column(name = "order_ref_id", nullable = false, length = 100)
    private String orderRefId;

    /**
     * shop_id bên ecommerce service.
     * Lưu String, KHÔNG phải FK, để tham chiếu lỏng (loose coupling).
     */
    @Column(name = "shop_ref_id", nullable = false, length = 100)
    private String shopRefId;

    /**
     * FK nội bộ sang shipment.
     * Khi shipment bị xoá, mapping sẽ bị xoá (CASCADE).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "shipment_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_mapping_shipment")
    )
    private Shipment shipment;

    /**
     * Bằng tracking_code của shipment liên kết.
     * Duy trì để dễ truy vấn và đôi khi quay lại tra by tracking.
     */
    @Column(name = "tracking_number", nullable = false, length = 100)
    private String trackingNumber;

    /**
     * Đơn vị vận chuyển.
     * VD: "GHN", "GHTK", "Viettel Post", "J&T", "DHL", ...
     */
    @Column(name = "carrier_name", length = 100)
    private String carrierName;

    /** Thời điểm mapping được tạo. */
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
