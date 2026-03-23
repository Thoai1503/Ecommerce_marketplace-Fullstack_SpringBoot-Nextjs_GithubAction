package docker_test.com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import docker_test.com.models.OrderShipment;

public interface OrderShipmentRepository extends JpaRepository<OrderShipment, Long> {

	List<OrderShipment> findByShopId(String shopId);
}
