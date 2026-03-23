package docker_test.com.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.model.Order;


public interface OrderRepository extends JpaRepository<Order,Long> {
    
	List<Order> findByUserId(Long userId);
	
	
	
	
}
