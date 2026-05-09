package logistic_service.com.repositories;

import logistic_service.com.entities.Shipment;
import logistic_service.com.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ShipmentRepository - Quản lý các vận đơn trong logistics service.
 */
@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long>, JpaSpecificationExecutor<Shipment> {

    /**
     * Tìm vận đơn theo tracking code.
     * Phương thức này thường được dùng bởi khách hàng để theo dõi hàng.
     */
    Optional<Shipment> findByTrackingCode(String trackingCode);

    /**
     * Lấy tất cả vận đơn của một order từ ecommerce.
     * Hỗ trợ multi-tracking (1 order -> N shipments).
     */
    List<Shipment> findByOrderShipmentRefId(Long orderRefId);

    Optional<Shipment> findFirstByOrderShipmentRefId(Long orderShipmentRefId);

    Optional<Shipment> findFirstByOrderShipmentRefIdAndNoteContaining(Long orderShipmentRefId, String note);

    /**
     * Lấy tất cả vận đơn của một shop.
     */
    List<Shipment> findByShopRefId(Long shopRefId);

    /**
     * Lấy vận đơn của 1 shop với filter theo status.
     */
    List<Shipment> findByShopRefIdAndStatus(Long shopRefId, ShipmentStatus status);

    /**
     * Lấy vận đơn theo partner (nhà vận chuyển).
     */
    List<Shipment> findByPartnerId(Long partnerId);

    /**
     * Lấy vận đơn theo recipient (người nhận).
     */
    List<Shipment> findByRecipientId(Long recipientId);

    /**
     * Lấy tất cả vận đơn với status nhất định.
     * Dùng để theo dõi, để quản lý, etc.
     */
    List<Shipment> findByStatus(ShipmentStatus status);

    Page<Shipment> findByStatus(ShipmentStatus status, Pageable pageable);

    /**
     * Lấy vận đơn chưa giao (chưa đạt trạng thái DELIVERED, FAILED hoặc RETURNED).
     */
    @Query("SELECT s FROM Shipment s WHERE s.status NOT IN ('DELIVERED', 'FAILED', 'RETURNED')")
    List<Shipment> findPendingShipments();

    /**
     * Lấy vận đơn đã quá hạn giao (estimatedDeliveryAt < now và chưa delivered).
     */
    @Query("SELECT s FROM Shipment s WHERE s.estimatedDeliveryAt < CURRENT_TIMESTAMP " +
           "AND s.status NOT IN ('DELIVERED', 'FAILED', 'RETURNED')")
    List<Shipment> findOverdueShipments();

    /**
     * Lấy vận đơn được tạo trong khoảng thời gian.
     */
    List<Shipment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Lấy vận đơn giao thành công (DELIVERED) trong khoảng thời gian.
     */
    @Query("SELECT s FROM Shipment s WHERE s.status = 'DELIVERED' " +
           "AND s.deliveredAt BETWEEN :startDate AND :endDate")
    List<Shipment> findDeliveredShipmentsBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Lấy vận đơn theo shop trong khoảng thời gian.
     */
    List<Shipment> findByShopRefIdAndCreatedAtBetween(
        Long shopRefId,
        LocalDateTime startDate,
        LocalDateTime endDate
    );
    
    /**
     * Đếm số vận đơn theo status.
     */
    long countByStatus(ShipmentStatus status);

    /**
     * Đếm số vận đơn của shop.
     */
    long countByShopRefId(Long shopRefId);

    /**
     * Kiểm tra tracking code đã tồn tại hay chưa.
     */
    boolean existsByTrackingCode(String trackingCode);
}
