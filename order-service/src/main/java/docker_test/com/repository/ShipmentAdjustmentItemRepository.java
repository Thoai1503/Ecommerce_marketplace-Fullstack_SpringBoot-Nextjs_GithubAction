package docker_test.com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.model.ShipmentAdjustmentItem;

public interface ShipmentAdjustmentItemRepository extends JpaRepository<ShipmentAdjustmentItem, Long> {
    List<ShipmentAdjustmentItem> findByAdjustmentRequestId(Long adjustmentRequestId);
}
