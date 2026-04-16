package docker_test.com.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.model.ShipmentAdjustmentRequest;

public interface ShipmentAdjustmentRequestRepository extends JpaRepository<ShipmentAdjustmentRequest, Long> {

    Optional<ShipmentAdjustmentRequest> findFirstByOrderShipmentIdAndStatus(Long orderShipmentId, String status);
}
