package logistic_service.com.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import logistic_service.com.dto.RecipientDTO;
import logistic_service.com.dto.RefundRequestDTO;
import logistic_service.com.dto.RequestItemDTO;
import logistic_service.com.entities.Recipient;
import logistic_service.com.entities.Shipment;
import logistic_service.com.entities.ShipmentItem;
import logistic_service.com.enums.ShipmentDirection;
import logistic_service.com.enums.ShipmentStatus;
import logistic_service.com.repositories.ShipmentItemRepository;
import logistic_service.com.repositories.ShipmentRepository;

@Service
public class ReturnRequestLogisticService {

	private static final Logger LOGGER = LoggerFactory.getLogger(ReturnRequestLogisticService.class);
	private static final Long DEFAULT_PARTNER_ID = 1L;

	private final ShipmentRepository shipmentRepository;
	private final ShipmentItemRepository shipmentItemRepository;
	private final RecipientCreatingService recipientCreatingService;

	public ReturnRequestLogisticService(
			ShipmentRepository shipmentRepository,
			ShipmentItemRepository shipmentItemRepository,
			RecipientCreatingService recipientCreatingService) {
		this.shipmentRepository = shipmentRepository;
		this.shipmentItemRepository = shipmentItemRepository;
		this.recipientCreatingService = recipientCreatingService;
	}

	@Transactional
	public Shipment createReturnShipment(RefundRequestDTO refundRequest) {
		validate(refundRequest);

		String requestMarker = buildRequestMarker(refundRequest);
		Optional<Shipment> existingShipment = shipmentRepository.findFirstByOrderShipmentRefIdAndDirection(
				refundRequest.getOrderShipmentId(),
				ShipmentDirection.RETURN);

		if (existingShipment.isPresent()) {
			LOGGER.info(
					"Return shipment already exists for returnRequestId={} orderShipmentId={}",
					refundRequest.getReturnRequestId(),
					refundRequest.getOrderShipmentId());
			return existingShipment.get();
		}

		Recipient recipient = recipientCreatingService.createRecipient(resolveRecipient(refundRequest));
		Recipient pickupContact = recipientCreatingService.createRecipient(resolvePickupContact(refundRequest));

		Shipment shipment = Shipment.builder()
			.trackingCode(generateTrackingCode())
			.orderShipmentRefId(refundRequest.getReturnShipmentId())
			.shopRefId(refundRequest.getShopId())
			.partnerId(DEFAULT_PARTNER_ID)
			.recipientId(recipient.getId())
			.pickupContactId(pickupContact.getId())
			.returnRequestRefId(refundRequest.getReturnRequestId())
			.returnShipmentRefId(refundRequest.getReturnShipmentId())
	        			.originalShipmentId(refundRequest.getOrderShipmentId())
	        .businessRefType("RETURN_SHIPMENT")			
			.status(ShipmentStatus.PENDING)
			.shippingFee(0d)
			.codAmount(0d)
			.direction(ShipmentDirection.RETURN)
			.note(buildShipmentNote(refundRequest))
			.build();

		Shipment savedShipment = shipmentRepository.save(shipment);
		List<ShipmentItem> shipmentItems = new ArrayList<>();

		for (RequestItemDTO item : refundRequest.getItems()) {
			shipmentItems.add(ShipmentItem.builder()
					.shipmentId(savedShipment.getId())
					.returnRequestItemRefId(resolveReturnRequestItemRefId(item))
					.productName(resolveProductName(item))
					.sku(item.getSku())
					.quantity(item.getQuantity())
					.price(resolveItemPrice(item))
					.build());
		}

		shipmentItemRepository.saveAll(shipmentItems);
		LOGGER.info(
				"Created return shipment id={} with {} items for returnRequestId={}",
				savedShipment.getId(),
				shipmentItems.size(),
				refundRequest.getReturnRequestId());
		return savedShipment;
	}

	private void validate(RefundRequestDTO refundRequest) {
		if (refundRequest == null) {
			throw new IllegalArgumentException("RefundRequestDTO is required");
		}

		if (refundRequest.getOrderShipmentId() == null) {
			throw new IllegalArgumentException("orderShipmentId is required for logistics processing");
		}

		if (refundRequest.getReturnRequestId() == null) {
			throw new IllegalArgumentException("returnRequestId is required for return shipment processing");
		}

		if (refundRequest.getShopId() == null) {
			throw new IllegalArgumentException("shopId is required for logistics processing");
		}

		if (refundRequest.getItems() == null || refundRequest.getItems().isEmpty()) {
			throw new IllegalArgumentException("return request must contain at least one item");
		}

		for (RequestItemDTO item : refundRequest.getItems()) {
			if (item.getOrderItemId() == null) {
				throw new IllegalArgumentException("each return item must contain orderItemId");
			}
			if (item.getQuantity() <= 0) {
				throw new IllegalArgumentException("each return item must have quantity > 0");
			}
		}
	}

	private RecipientDTO resolveRecipient(RefundRequestDTO refundRequest) {
		if (refundRequest.getRecipient() != null) {
			return refundRequest.getRecipient();
		}
		if (refundRequest.getPickupContact() != null) {
			return refundRequest.getPickupContact();
		}

		RecipientDTO fallbackRecipient = new RecipientDTO();
		fallbackRecipient.setName("Return customer " + refundRequest.getCustomerId());
		fallbackRecipient.setPhone("PENDING-" + refundRequest.getCustomerId());
		fallbackRecipient.setAddress("Pending pickup address for return order_shipment_id=" + refundRequest.getOrderShipmentId());
		fallbackRecipient.setEmail(null);
		return fallbackRecipient;
	}

	private RecipientDTO resolvePickupContact(RefundRequestDTO refundRequest) {
		if (refundRequest.getPickupContact() != null) {
			return refundRequest.getPickupContact();
		}
		return resolveRecipient(refundRequest);
	}

	private String buildShipmentNote(RefundRequestDTO refundRequest) {
		StringBuilder noteBuilder = new StringBuilder();
			noteBuilder.append(buildRequestMarker(refundRequest));
		if (!isBlank(refundRequest.getReason())) {
			noteBuilder.append(" reason=").append(refundRequest.getReason());
		}
		if (!isBlank(refundRequest.getDescription())) {
			noteBuilder.append(" description=").append(refundRequest.getDescription());
		}
		return noteBuilder.toString();
	}

	private String buildRequestMarker(RefundRequestDTO refundRequest) {
		if (refundRequest.getReturnRequestId() != null) {
			return "[RETURN_REQUEST_ID=" + refundRequest.getReturnRequestId() + "]";
		}
		return "[RETURN_ORDER_SHIPMENT_ID=" + refundRequest.getOrderShipmentId()
				+ ";CUSTOMER_ID=" + refundRequest.getCustomerId()
				+ ";REQUESTED_AMOUNT=" + refundRequest.getRequestedAmount() + "]";
	}

	private String generateTrackingCode() {
		return "RET" + UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 8);
	}

	private String resolveProductName(RequestItemDTO item) {
		if (!isBlank(item.getProductName())) {
			return item.getProductName();
		}
		return "RETURN_ITEM_" + item.getOrderItemId();
	}

	private double resolveItemPrice(RequestItemDTO item) {
		if (item.getPrice() > 0) {
			return item.getPrice();
		}
		return item.getRequestedAmount();
	}

	private Long resolveReturnRequestItemRefId(RequestItemDTO item) {
		return item.getOrderItemId();
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}