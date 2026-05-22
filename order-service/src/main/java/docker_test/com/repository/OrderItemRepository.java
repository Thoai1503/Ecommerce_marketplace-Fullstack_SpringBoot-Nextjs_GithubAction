package docker_test.com.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import docker_test.com.model.OrderItem;
import jakarta.transaction.Transactional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{

	List<OrderItem> findByOrderId(Long orderId);
	List<OrderItem> findByShipmentIdIn(Collection<Long> shipmentIds);
	List<OrderItem> findByShipmentId(Long shipmentId);
	Optional<OrderItem> findByIdAndShipmentId(Long id, Long shipmentId);
    

    @Transactional  
	@Query(value="UPDATE order_item SET return_request_quantity = :returnQuantity WHERE id = :id", nativeQuery = true)
    @Modifying
    void updateReturnQuantity(@Param("id") Long id, @Param("returnQuantity") Integer returnQuantity);
}
