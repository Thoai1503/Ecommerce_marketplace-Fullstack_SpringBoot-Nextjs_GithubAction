package logistic_service.com.entities;

import logistic_service.com.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ShipmentStatusHistory - Lịch sử thay đổi trạng thái của vận đơn.
 * 
 * Đây là nguồn dữ liệu cho trang tracking của khách hàng.
 * Mỗi khi status của Shipment thay đổi, một record mới được thêm vào bảng này.
 * Trigger tự động ghi lại mỗi thay đổi status.
 */
@Entity
@Table(
    name = "shipment_status_history",
    indexes = {
        @Index(name = "idx_status_history_shipment", columnList = "shipment_id"),
        @Index(name = "idx_status_history_time",     columnList = "updated_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FK nội bộ sang shipment.
     * Khi shipment bị xoá, tất cả history records sẽ bị xoá (CASCADE).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "shipment_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_history_shipment")
    )
    private Shipment shipment;

    /** Trạng thái tại sự kiện này. */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ShipmentStatus status;

    /**
     * Mô tả sự kiện.
     * VD: "Đã lấy hàng tại kho Bình Thạnh"
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Địa điểm xảy ra sự kiện.
     * VD: "Kho Bình Thạnh, TP.HCM"
     */
    @Column(name = "location", length = 255)
    private String location;

    /**
     * Ai/hệ thống nào cập nhật.
     * Giá trị có thể: "admin" | "driver_app" | "webhook" | "system"
     */
    @Column(name = "updated_by", length = 100)
    @Builder.Default
    private String updatedBy = "system";

    /** Thời điểm cập nhật status (tự động ghi lại bởi database trigger). */
    @Column(name = "updated_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
