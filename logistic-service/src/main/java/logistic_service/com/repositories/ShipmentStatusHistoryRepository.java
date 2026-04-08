package logistic_service.com.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import logistic_service.com.entities.ShipmentStatusHistory;

@Repository
public interface ShipmentStatusHistoryRepository extends JpaRepository<ShipmentStatusHistory, Long> {
    List<ShipmentStatusHistory> findByShipmentIdOrderByUpdatedAtAsc(Long shipmentId);
}
