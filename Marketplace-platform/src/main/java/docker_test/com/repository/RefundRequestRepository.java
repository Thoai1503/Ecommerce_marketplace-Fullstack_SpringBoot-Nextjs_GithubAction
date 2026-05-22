package docker_test.com.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Repository;

import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestStatus;

@Repository
public interface RefundRequestRepository extends org.springframework.data.jpa.repository.JpaRepository<ReturnRequest, Long> {

	ReturnRequest findByOrderShipmentId(Long orderShipmentId);

	List<ReturnRequest> findByShopId(Long shopId);

	List<ReturnRequest> findByOrderId(Long orderId);

	List<ReturnRequest> findByOrderIdAndStatusIn(Long orderId, Collection<ReturnRequestStatus> statuses);
}
