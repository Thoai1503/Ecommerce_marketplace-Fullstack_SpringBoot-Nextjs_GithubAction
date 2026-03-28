package docker_test.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
    
	
	
}
