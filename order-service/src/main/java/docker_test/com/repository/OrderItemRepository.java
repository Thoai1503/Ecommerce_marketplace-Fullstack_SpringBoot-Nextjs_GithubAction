package docker_test.com.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{

	List<OrderItem> findByShipmentIdIn(Collection<Long> shipmentIds);
}
