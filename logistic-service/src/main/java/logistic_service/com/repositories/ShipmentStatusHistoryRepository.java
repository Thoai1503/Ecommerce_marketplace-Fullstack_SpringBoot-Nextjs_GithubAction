package logistic_service.com.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import logistic_service.com.entities.ShipmentStatusHistory;

@Repository
public interface ShipmentStatusHistoryRepository extends JpaRepository<ShipmentStatusHistory, Long> {
    List<ShipmentStatusHistory> findByShipmentIdOrderByUpdatedAtAsc(Long shipmentId);
    
    /**
     * MySQL stored procedure to sync shipment.updated_at with latest shipment_status_history.updated_at
     * 
     * IMPORTANT: Call this method after inserting new status history
     * to prevent timezone mismatch between tables
     * 
     * This prevents error: "Can't update table 'shipment' in stored function/trigger"
     * by using application-layer sync instead of database triggers
     */
    @Modifying
    @Transactional
    @Query(value = "CALL sync_shipment_updated_at_timestamps()", nativeQuery = true)
    void syncShipmentTimestamps();
}
