package docker_test.com.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import docker_test.com.models.refunds.ReturnRequestAttachment;
import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestStatus;
import jakarta.persistence.LockModeType;

@Repository
public interface RefundRequestRepository extends org.springframework.data.jpa.repository.JpaRepository<ReturnRequest, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select rr from ReturnRequest rr where rr.id = :id  and rr.status not in ('CANCELLED')")
	Optional<ReturnRequest> findByIdForUpdate(Long id);

	ReturnRequest findByOrderShipmentId(Long orderShipmentId);

	// find by order shipment id and status not in cancelled	
	
	ReturnRequest findByOrderShipmentIdAndStatusNot(Long orderShipmentId, ReturnRequestStatus status);
	
	
	@Query("""
			select distinct rr
			from ReturnRequest rr
			where exists (
				select 1
				from ReturnRequestAttachment ra
				where ra.returnRequestId = rr.id  
			)
			""")
	List<ReturnRequest> findAllWithAttachments();

	@Query(value = """
			select rr.*
			from return_request rr
			left join orders o on o.id = rr.order_id
			left join order_shipment os on os.id = rr.order_shipment_id
			left join `user` u on u.id = rr.customer_id
			left join shop s on s.id = rr.shop_id
			where exists (
				select 1
				from return_request_attachment ra
				where ra.return_request_id = rr.id
			)
			and (:status is null or :status = '' or upper(rr.status) = upper(:status))
			and (:shopId is null or rr.shop_id = :shopId)
			and (:customerId is null or rr.customer_id = :customerId)
			and (:search is null or :search = ''
				or lower(cast(rr.id as char)) like lower(concat('%', :search, '%'))
				or lower(coalesce(rr.reason, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(o.order_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(o.tracking_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(os.tracking_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.full_name, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.phone, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(s.shop_name, '')) like lower(concat('%', :search, '%'))
			)
			and (:startDate is null or rr.created_at >= :startDate)
			and (:endDateExclusive is null or rr.created_at < :endDateExclusive)
			order by rr.created_at desc, rr.id desc
			""",
			countQuery = """
				select count(*)
				from return_request rr
				left join orders o on o.id = rr.order_id
				left join order_shipment os on os.id = rr.order_shipment_id
				left join `user` u on u.id = rr.customer_id
				left join shop s on s.id = rr.shop_id
				where exists (
					select 1
					from return_request_attachment ra
					where ra.return_request_id = rr.id
				)
				and (:status is null or :status = '' or upper(rr.status) = upper(:status))
				and (:shopId is null or rr.shop_id = :shopId)
				and (:customerId is null or rr.customer_id = :customerId)
				and (:search is null or :search = ''
					or lower(cast(rr.id as char)) like lower(concat('%', :search, '%'))
					or lower(coalesce(rr.reason, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(o.order_number, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(o.tracking_number, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(os.tracking_number, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(u.full_name, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(u.phone, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(s.shop_name, '')) like lower(concat('%', :search, '%'))
				)
				and (:startDate is null or rr.created_at >= :startDate)
				and (:endDateExclusive is null or rr.created_at < :endDateExclusive)
				""",
			nativeQuery = true)
	Page<ReturnRequest> findAllWithAttachmentsPaged(
			@Param("status") String status,
			@Param("search") String search,
			@Param("shopId") Long shopId,
			@Param("customerId") Long customerId,
			@Param("startDate") java.time.LocalDateTime startDate,
			@Param("endDateExclusive") java.time.LocalDateTime endDateExclusive,
			Pageable pageable);

	@Query(value = """
			select upper(rr.status) as status,
			       count(*) as total,
			       coalesce(sum(rr.requested_amount), 0) as amount
			from return_request rr
			left join orders o on o.id = rr.order_id
			left join order_shipment os on os.id = rr.order_shipment_id
			left join `user` u on u.id = rr.customer_id
			left join shop s on s.id = rr.shop_id
			where exists (
				select 1
				from return_request_attachment ra
				where ra.return_request_id = rr.id
			)
			and (:status is null or :status = '' or upper(rr.status) = upper(:status))
			and (:shopId is null or rr.shop_id = :shopId)
			and (:customerId is null or rr.customer_id = :customerId)
			and (:search is null or :search = ''
				or lower(cast(rr.id as char)) like lower(concat('%', :search, '%'))
				or lower(coalesce(rr.reason, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(o.order_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(o.tracking_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(os.tracking_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.full_name, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.phone, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(s.shop_name, '')) like lower(concat('%', :search, '%'))
			)
			and (:startDate is null or rr.created_at >= :startDate)
			and (:endDateExclusive is null or rr.created_at < :endDateExclusive)
			group by upper(rr.status)
			""", nativeQuery = true)
	List<Object[]> countAllWithAttachmentsStats(
			@Param("status") String status,
			@Param("search") String search,
			@Param("shopId") Long shopId,
			@Param("customerId") Long customerId,
			@Param("startDate") java.time.LocalDateTime startDate,
			@Param("endDateExclusive") java.time.LocalDateTime endDateExclusive);

	@Query("""
			select distinct rr
			from ReturnRequest rr
			where rr.shopId = :shopId
			and exists (
				select 1
				from ReturnRequestAttachment ra
				where ra.returnRequestId = rr.id
			)
			""")
	List<ReturnRequest> findByShopIdWithAttachments(Long shopId);

	@Query(value = """
			select rr.*
			from return_request rr
			left join orders o on o.id = rr.order_id
			left join order_shipment os on os.id = rr.order_shipment_id
			left join `user` u on u.id = rr.customer_id
			left join shop s on s.id = rr.shop_id
			where exists (
				select 1
				from return_request_attachment ra
				where ra.return_request_id = rr.id
			)
			and rr.shop_id = :shopId
			and (:status is null or :status = '' or upper(rr.status) = upper(:status))
			and (:customerId is null or rr.customer_id = :customerId)
			and (:search is null or :search = ''
				or lower(cast(rr.id as char)) like lower(concat('%', :search, '%'))
				or lower(coalesce(rr.reason, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(o.order_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(o.tracking_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(os.tracking_number, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.full_name, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(u.phone, '')) like lower(concat('%', :search, '%'))
				or lower(coalesce(s.shop_name, '')) like lower(concat('%', :search, '%'))
			)
			and (:startDate is null or rr.created_at >= :startDate)
			and (:endDateExclusive is null or rr.created_at < :endDateExclusive)
			order by rr.created_at desc, rr.id desc
			""",
			countQuery = """
				select count(*)
				from return_request rr
				left join orders o on o.id = rr.order_id
				left join order_shipment os on os.id = rr.order_shipment_id
				left join `user` u on u.id = rr.customer_id
				left join shop s on s.id = rr.shop_id
				where exists (
					select 1
					from return_request_attachment ra
					where ra.return_request_id = rr.id
				)
				and rr.shop_id = :shopId
				and (:status is null or :status = '' or upper(rr.status) = upper(:status))
				and (:customerId is null or rr.customer_id = :customerId)
				and (:search is null or :search = ''
					or lower(cast(rr.id as char)) like lower(concat('%', :search, '%'))
					or lower(coalesce(rr.reason, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(o.order_number, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(o.tracking_number, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(os.tracking_number, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(u.full_name, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(u.phone, '')) like lower(concat('%', :search, '%'))
					or lower(coalesce(s.shop_name, '')) like lower(concat('%', :search, '%'))
				)
				and (:startDate is null or rr.created_at >= :startDate)
				and (:endDateExclusive is null or rr.created_at < :endDateExclusive)
				""",
			nativeQuery = true)
	Page<ReturnRequest> findByShopIdWithAttachmentsPaged(
			@Param("shopId") Long shopId,
			@Param("status") String status,
			@Param("search") String search,
			@Param("customerId") Long customerId,
			@Param("startDate") java.time.LocalDateTime startDate,
			@Param("endDateExclusive") java.time.LocalDateTime endDateExclusive,
			Pageable pageable);

	List<ReturnRequest> findByShopId(Long shopId);

	List<ReturnRequest> findByOrderId(Long orderId);

	List<ReturnRequest> findByOrderIdAndStatusIn(Long orderId, Collection<ReturnRequestStatus> statuses);
}
