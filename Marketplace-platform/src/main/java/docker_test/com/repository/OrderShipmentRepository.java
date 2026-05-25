package docker_test.com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import docker_test.com.models.OrderShipment;

public interface OrderShipmentRepository extends JpaRepository<OrderShipment, Long> {

	List<OrderShipment> findByShopId(String shopId);

	@Modifying
	@Query("""
			update OrderShipment os
			set os.payoutSettled = true,
			    os.payoutSettledAt = CURRENT_TIMESTAMP
			where os.id = :shipmentId
		""")
	int markPayoutSettled(@Param("shipmentId") Long shipmentId);
}
