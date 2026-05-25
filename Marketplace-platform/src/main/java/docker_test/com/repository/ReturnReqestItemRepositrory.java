package docker_test.com.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import docker_test.com.models.refunds.ReturnRequestItem;
import docker_test.com.models.refunds.ReturnRequestStatus;

@Repository
public interface ReturnReqestItemRepositrory extends org.springframework.data.jpa.repository.JpaRepository<ReturnRequestItem, Long> {

	@Query("""
			SELECT DISTINCT item.orderItemId
			FROM ReturnRequestItem item
			JOIN item.returnRequest request
			WHERE item.orderItemId IN :orderItemIds
			  AND request.status IN :statuses
			""")
	List<Long> findOrderItemIdsWithStatuses(
			@Param("orderItemIds") Collection<Long> orderItemIds,
			@Param("statuses") Collection<ReturnRequestStatus> statuses);
}
