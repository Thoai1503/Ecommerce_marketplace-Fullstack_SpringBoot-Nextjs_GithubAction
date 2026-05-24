package docker_test.com.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestStatus;
import jakarta.persistence.LockModeType;

@Repository
public interface RefundRequestRepository extends org.springframework.data.jpa.repository.JpaRepository<ReturnRequest, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select rr from ReturnRequest rr where rr.id = :id")
	Optional<ReturnRequest> findByIdForUpdate(Long id);

	ReturnRequest findByOrderShipmentId(Long orderShipmentId);

	List<ReturnRequest> findByShopId(Long shopId);

	List<ReturnRequest> findByOrderId(Long orderId);

	List<ReturnRequest> findByOrderIdAndStatusIn(Long orderId, Collection<ReturnRequestStatus> statuses);
}
