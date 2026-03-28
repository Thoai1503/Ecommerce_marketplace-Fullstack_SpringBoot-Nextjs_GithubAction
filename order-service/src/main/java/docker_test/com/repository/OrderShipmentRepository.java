package docker_test.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import docker_test.com.model.OrderShipment;

@Repository
public interface OrderShipmentRepository extends JpaRepository<OrderShipment, Long> {
    
	
	
}
