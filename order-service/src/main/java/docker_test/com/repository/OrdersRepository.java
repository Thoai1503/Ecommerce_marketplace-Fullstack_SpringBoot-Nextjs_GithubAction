package docker_test.com.repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import docker_test.com.model.Order;


public interface OrdersRepository extends JpaRepository<Order,Long> {

	List<Order> findByUserId(Long userId);

	@Query(value = """
			SELECT
			  o.id AS id,
			  o.id AS orderId,
			  o.order_number AS orderNumber,
			  o.user_id AS userId,
			  o.address_id AS addressId,
			  o.total_amount AS totalAmount,
			  o.shipping_fee AS shippingFee,
			  o.discount_amount AS discountAmount,
			  o.final_amount AS finalAmount,
			  o.payment_status AS paymentStatus,
			  o.payment_method AS paymentMethod,
			  o.order_status AS orderStatus,
			  o.tracking_number AS trackingNumber,
			  o.return_status_summary AS returnStatusSummary,
			  o.last_return_request_id AS lastReturnRequestId,
			  o.created_at AS createdAt,
			  o.updated_at AS updatedAt,
			  COALESCE(u.full_name, 'Customer') AS customerName,
			  COALESCE(u.email, '') AS customerEmail,
			  COALESCE(u.phone, '') AS customerPhone,
			  COALESCE(oi.items_count, 0) AS itemsCount,
			  COALESCE(os.shipments_count, 0) AS shipmentsCount
			FROM orders o
			LEFT JOIN `user` u ON u.id = o.user_id
			LEFT JOIN (
			  SELECT order_id, COUNT(*) AS items_count
			  FROM order_item
			  GROUP BY order_id
			) oi ON oi.order_id = o.id
			LEFT JOIN (
			  SELECT order_id, COUNT(*) AS shipments_count
			  FROM order_shipment
			  GROUP BY order_id
			) os ON os.order_id = o.id
			WHERE (?1 IS NULL OR o.user_id = ?1)
			  AND (?2 IS NULL OR o.created_at >= ?2)
			  AND (?3 IS NULL OR o.created_at <= ?3)
			  AND (?4 IS NULL OR o.final_amount >= ?4)
			  AND (?5 IS NULL OR o.final_amount <= ?5)
			  AND (?6 IS NULL OR LOWER(?6) = 'all' OR LOWER(o.order_status) = LOWER(?6))
			ORDER BY
			  CASE WHEN LOWER(COALESCE(?7, 'date')) = 'amount' AND LOWER(COALESCE(?8, 'asc')) = 'asc' THEN o.final_amount END ASC,
			  CASE WHEN LOWER(COALESCE(?7, 'date')) = 'amount' AND LOWER(COALESCE(?8, 'asc')) = 'desc' THEN o.final_amount END DESC,
			  CASE WHEN LOWER(COALESCE(?7, 'date')) <> 'amount' AND LOWER(COALESCE(?8, 'asc')) = 'asc' THEN o.created_at END ASC,
			  CASE WHEN LOWER(COALESCE(?7, 'date')) <> 'amount' AND LOWER(COALESCE(?8, 'asc')) = 'desc' THEN o.created_at END DESC
			LIMIT ?9 OFFSET ?10
			""", nativeQuery = true)
	List<AdminOrderListProjection> findAdminOrdersWithCustomerNative(
			Long userId,
			LocalDateTime startDate,
			LocalDateTime endDate,
			Double minAmount,
			Double maxAmount,
			String status,
			String sortBy,
			String sortOrder,
			int size,
			int offset
	);

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

	default List<AdminOrderListProjection> findAllAdminOrdersWithCustomer(
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
		return findAdminOrdersWithCustomerNative(
				userId,
				startDate,
				endDate,
				minAmount,
				maxAmount,
				status,
				sortBy,
				sortOrder,
				safeSize,
				offset
		);
	}

	default Order findByIdOrNull(Long id) {
		return findById(id).orElse(null);
	}
}
