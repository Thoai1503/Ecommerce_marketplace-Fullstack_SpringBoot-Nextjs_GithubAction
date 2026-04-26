package docker_test.com.repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import docker_test.com.model.Order;


public interface OrderRepository extends JpaRepository<Order,Long> {

	List<Order> findByUserId(Long userId);

	@Query(value = """
			SELECT o.*
			FROM orders o
			WHERE (?1 IS NULL OR o.user_id = ?1)
			  AND (?2 IS NULL OR o.created_at >= ?2)
			  AND (?3 IS NULL OR o.created_at <= ?3)
			  AND (?4 IS NULL OR o.final_amount >= ?4)
			  AND (?5 IS NULL OR o.final_amount <= ?5)
			ORDER BY
			  CASE WHEN LOWER(COALESCE(?6, 'date')) = 'amount' AND LOWER(COALESCE(?7, 'asc')) = 'asc' THEN o.final_amount END ASC,
			  CASE WHEN LOWER(COALESCE(?6, 'date')) = 'amount' AND LOWER(COALESCE(?7, 'asc')) = 'desc' THEN o.final_amount END DESC,
			  CASE WHEN LOWER(COALESCE(?6, 'date')) <> 'amount' AND LOWER(COALESCE(?7, 'asc')) = 'asc' THEN o.created_at END ASC,
			  CASE WHEN LOWER(COALESCE(?6, 'date')) <> 'amount' AND LOWER(COALESCE(?7, 'asc')) = 'desc' THEN o.created_at END DESC
			LIMIT ?8 OFFSET ?9
			""", nativeQuery = true)
	List<Order> findAllWithPaginationNative(
			Long userId,
			LocalDateTime startDate,
			LocalDateTime endDate,
			Double minAmount,
			Double maxAmount,
			String sortBy,
			String sortOrder,
			int size,
			int offset
	);

	@Query(value = """
			SELECT COUNT(*)
			FROM orders o
			WHERE (:userId IS NULL OR o.user_id = :userId)
			  AND (:startDate IS NULL OR o.created_at >= :startDate)
			  AND (:endDate IS NULL OR o.created_at <= :endDate)
			  AND (:minAmount IS NULL OR o.final_amount >= :minAmount)
			  AND (:maxAmount IS NULL OR o.final_amount <= :maxAmount)
			  AND (:status IS NULL OR LOWER(:status) = 'all' OR LOWER(o.order_status) = LOWER(:status))
			""", nativeQuery = true)
	int countOrders(
			@Param("userId") Long userId,
			@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate,
			@Param("minAmount") Double minAmount,
			@Param("maxAmount") Double maxAmount,
			@Param("status") String status
	);

	@Query(value = """
			SELECT o.order_status AS orderStatus, COUNT(*) AS total
			FROM orders o
			GROUP BY o.order_status
			""", nativeQuery = true)
	List<OrderStatusCountProjection> countByStatusRows();

	default Map<String, Integer> countByStatus() {
		return countByStatusRows().stream()
				.collect(Collectors.toMap(
						OrderStatusCountProjection::getOrderStatus,
						row -> row.getTotal() == null ? 0 : row.getTotal().intValue()
				));
	}

	@Query(value = """
			SELECT COALESCE(SUM(o.final_amount), 0)
			FROM orders o
			WHERE LOWER(o.order_status) = 'pending'
			""", nativeQuery = true)
	Double getPendingTotalAmount();

	default List<Order> findAllWithPagination(
			Long userId,
			LocalDateTime startDate,
			LocalDateTime endDate,
			Double minAmount,
			Double maxAmount,
			String status,
			String sortBy,
			String sortOrder,
			int page,
			int size
	) {
		int safePage = Math.max(page, 1);
		int safeSize = Math.max(size, 1);
		int offset = (safePage - 1) * safeSize;
		return findAllWithPaginationNative(userId, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, safeSize, offset);
	}

	default Order findByIdOrNull(Long id) {
		return findById(id).orElse(null);
	}
}
