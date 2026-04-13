package docker_test.com.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import docker_test.com.model.OrderShipment;

@Repository
public interface OrderShipmentRepository extends JpaRepository<OrderShipment, Long> {

	Optional<OrderShipment> findFirstByTrackingNumber(String trackingNumber);

	@Query(value = """
			SELECT
				os.id AS shipmentId,
				os.order_id AS orderId,
				os.shop_id AS shopId,
				os.carrier_name AS carrierName,
				os.tracking_number AS trackingNumber,
				os.shipping_status AS shippingStatus,
				o.order_number AS orderNumber,
				o.user_id AS userId,
				o.address_id AS addressId,
				o.total_amount AS totalAmount,
				o.shipping_fee AS shippingFee,
				o.discount_amount AS discountAmount,
				o.final_amount AS finalAmount,
				o.payment_method AS paymentMethod,
				o.payment_status AS paymentStatus,
				o.order_status AS orderStatus,
				a.recipient_name AS recipientName,
				a.recipient_phone AS recipientPhone,
				a.address_line AS addressLine,
				a.ward AS ward,
				a.district AS district,
				a.city AS city,
				a.postal_code AS postalCode
			FROM order_shipment os
			INNER JOIN orders o ON o.id = os.order_id
			INNER JOIN address a ON a.id = o.address_id
			WHERE os.shop_id = :shopId
			ORDER BY os.id DESC
			""", nativeQuery = true)
	List<OrderShipmentWithOrderAndRecipientProjection> findShipmentDetailsByShopId(@Param("shopId") Long shopId);
}
