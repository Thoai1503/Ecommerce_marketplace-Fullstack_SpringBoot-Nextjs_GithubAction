package docker_test.com.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{

	List<OrderItem> findByOrderId(Long orderId);
	List<OrderItem> findByShipmentIdIn(Collection<Long> shipmentIds);
	List<OrderItem> findByShipmentId(Long shipmentId);
	Optional<OrderItem> findByIdAndShipmentId(Long id, Long shipmentId);
}
