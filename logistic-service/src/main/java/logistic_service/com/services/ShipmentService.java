package logistic_service.com.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

import logistic_service.com.dto.PageResponse;
import logistic_service.com.dto.RecipientDTO;
import logistic_service.com.dto.ShipmentItemResponse;
import logistic_service.com.dto.ShipmentSummaryResponse;
import logistic_service.com.dto.ShipmentTrackingDetailResponse;
import logistic_service.com.dto.ShipmentTimelineResponse;
import logistic_service.com.entities.Recipient;
import logistic_service.com.entities.Shipment;
import logistic_service.com.entities.ShipmentItem;
import logistic_service.com.entities.ShipmentStatusHistory;
import logistic_service.com.enums.ShipmentStatus;
import logistic_service.com.dto.ShipmentStatusUpdatedEvent;
import logistic_service.com.exception.InvalidShipmentStatusTransitionException;
import logistic_service.com.publisher.OrderStatusPublisher;
import logistic_service.com.repositories.RecipientRepository;
import logistic_service.com.repositories.ShipmentItemRepository;
import logistic_service.com.repositories.ShipmentRepository;
import logistic_service.com.repositories.ShipmentStatusHistoryRepository;

@Service
public class ShipmentService {
	private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ShipmentService.class);
	private final ShipmentRepository shipmentRepository;
	private final ShipmentStatusHistoryRepository shipmentStatusHistoryRepository;
	private final RecipientRepository recipientRepository;
	private final ShipmentItemRepository shipmentItemRepository;
	private final OrderStatusPublisher orderStatusPublisher;

	public ShipmentService(ShipmentRepository shipmentRepository,
			ShipmentStatusHistoryRepository shipmentStatusHistoryRepository,
			RecipientRepository recipientRepository,
			ShipmentItemRepository shipmentItemRepository,
			OrderStatusPublisher orderStatusPublisher) {
		this.shipmentRepository = shipmentRepository;
		this.shipmentStatusHistoryRepository = shipmentStatusHistoryRepository;
		this.recipientRepository = recipientRepository;
		this.shipmentItemRepository = shipmentItemRepository;
		this.orderStatusPublisher = orderStatusPublisher;
	}
    
	public Shipment createShipment(Shipment shipment) {
		
		// Logic to save the shipment to the database
	return	shipmentRepository.save(shipment);
	}

	public Shipment updateStatusByOrderShipmentRefId(Long orderShipmentRefId, ShipmentStatus newStatus) {
		if (newStatus == null) {
			throw new InvalidShipmentStatusTransitionException("Status is required.");
		}

		Shipment shipment = shipmentRepository.findFirstByOrderShipmentRefId(orderShipmentRefId)
				.orElseThrow(() -> new IllegalArgumentException(
						"Shipment not found with orderShipmentRefId: " + orderShipmentRefId));
       log.info("Updating shipment (orderShipmentRefId={}) from status: {} to new status: {}",
			   orderShipmentRefId, shipment.getStatus(), newStatus);
		shipment.setStatus(newStatus);
		shipment.setUpdatedAt(LocalDateTime.now());
		if (newStatus == ShipmentStatus.DELIVERED) {
			shipment.setDeliveredAt(LocalDateTime.now());
		}
        log.info("Updated shipment (orderShipmentRefId={}) to status: {}", orderShipmentRefId, newStatus);
		try {
			Shipment saved = shipmentRepository.save(shipment);
			orderStatusPublisher.publishShipmentStatusUpdated(
					new ShipmentStatusUpdatedEvent(saved.getTrackingCode(), saved.getStatus(), Optional.of(saved.getOrderShipmentRefId())));
			return saved;
		} catch (DataIntegrityViolationException | JpaSystemException ex) {
			String dbMessage = extractRootCauseMessage(ex);
			throw new InvalidShipmentStatusTransitionException(dbMessage);
		}
	}		

	private String extractRootCauseMessage(Throwable ex) {
		Throwable current = ex;
		while (current.getCause() != null) {
			current = current.getCause();
		}

		String message = current.getMessage();
		if (message == null || message.isBlank()) {
			return "Invalid shipment status transition.";
		}

		int quotedStart = message.indexOf("'");
		int quotedEnd = message.lastIndexOf("'");
		if (quotedStart >= 0 && quotedEnd > quotedStart) {
			String candidate = message.substring(quotedStart + 1, quotedEnd).trim();
			if (!candidate.isBlank()) {
				return candidate;
			}
		}

		return "Invalid shipment status transition.";
	}

	public PageResponse<ShipmentSummaryResponse> getShipments(
			int page,
			int size,
			ShipmentStatus status,
			String trackingCode,
			Long shopRefId) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

		log.info("Fetching shipments with filters - status: {}, trackingCode: {}, shopRefId: {}, page: {}, size: {}",
				status, trackingCode, shopRefId, page, size);
		
		Specification<Shipment> spec = Specification.where(null);

		if (status != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
		}

		if (trackingCode != null && !trackingCode.isBlank()) {
			String normalizedTrackingCode = trackingCode.trim().toLowerCase();
			spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("trackingCode")), "%" + normalizedTrackingCode + "%"));
		}

		if (shopRefId != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("shopRefId"), shopRefId));
		}

		Page<Shipment> shipmentPage = shipmentRepository.findAll(spec, pageable);
		Page<ShipmentSummaryResponse> mappedPage = shipmentPage.map(this::toSummaryResponse);

		return new PageResponse<>(
				mappedPage.getContent(),
				mappedPage.getNumber(),
				mappedPage.getSize(),
				mappedPage.getTotalElements(),
				mappedPage.getTotalPages(),
				mappedPage.isFirst(),
				mappedPage.isLast());
	}

	public ShipmentTrackingDetailResponse getByTrackingCode(String trackingCode) {
		Shipment shipment = shipmentRepository.findByTrackingCode(trackingCode)
				.orElseThrow(() -> new IllegalArgumentException("Shipment not found with trackingCode: " + trackingCode));

		Recipient recipient = recipientRepository.findById(shipment.getRecipientId())
				.orElseThrow(() -> new IllegalArgumentException("Recipient not found with id: " + shipment.getRecipientId()));

		List<ShipmentItemResponse> items = shipmentItemRepository.findByShipmentId(shipment.getId()).stream()
				.map(this::toShipmentItemResponse)
				.toList();

		return new ShipmentTrackingDetailResponse(
				shipment.getId(),
				shipment.getTrackingCode(),
				shipment.getOrderShipmentRefId(),
				shipment.getShopRefId(),
				shipment.getPartnerId(),
				shipment.getRecipientId(),
				shipment.getStatus(),
				shipment.getCreatedAt(),
				shipment.getUpdatedAt(),
				shipment.getEstimatedDeliveryAt(),
				shipment.getDeliveredAt(),
				toRecipientDto(recipient),
				items);
	}

	public ShipmentTrackingDetailResponse getShipmentById(Long shipmentId) {
		Shipment shipment = shipmentRepository.findById(shipmentId)
				.orElseThrow(() -> new IllegalArgumentException("Shipment not found with id: " + shipmentId));

		Recipient recipient = recipientRepository.findById(shipment.getRecipientId())
				.orElseThrow(() -> new IllegalArgumentException("Recipient not found with id: " + shipment.getRecipientId()));

		List<ShipmentItemResponse> items = shipmentItemRepository.findByShipmentId(shipment.getId()).stream()
				.map(this::toShipmentItemResponse)
				.toList();

		return new ShipmentTrackingDetailResponse(
				shipment.getId(),
				shipment.getTrackingCode(),
				shipment.getOrderShipmentRefId(),
				shipment.getShopRefId(),
				shipment.getPartnerId(),
				shipment.getRecipientId(),
				shipment.getStatus(),
				shipment.getCreatedAt(),
				shipment.getUpdatedAt(),
				shipment.getEstimatedDeliveryAt(),
				shipment.getDeliveredAt(),
				toRecipientDto(recipient),
				items);
	}

	public List<ShipmentTimelineResponse> getTimelineByShipmentId(Long shipmentId) {
		if (!shipmentRepository.existsById(shipmentId)) {
			throw new IllegalArgumentException("Shipment not found with id: " + shipmentId);
		}

		List<ShipmentStatusHistory> histories = shipmentStatusHistoryRepository
				.findByShipmentIdOrderByUpdatedAtAsc(shipmentId);

		return histories.stream()
				.map(history -> new ShipmentTimelineResponse(
						history.getId(),
						history.getShipment().getId(),
						history.getStatus(),
						history.getDescription(),
						history.getLocation(),
						history.getUpdatedBy(),
						history.getUpdatedAt()))
				.toList();
	}

	private ShipmentSummaryResponse toSummaryResponse(Shipment shipment) {
		return new ShipmentSummaryResponse(
				shipment.getId(),
				shipment.getTrackingCode(),
				shipment.getOrderShipmentRefId(),
				shipment.getShopRefId(),
				shipment.getPartnerId(),
				shipment.getRecipientId(),
				shipment.getStatus(),
				shipment.getCreatedAt(),
				shipment.getUpdatedAt(),
				shipment.getEstimatedDeliveryAt(),
				shipment.getDeliveredAt());
	}

	private RecipientDTO toRecipientDto(Recipient recipient) {
		RecipientDTO recipientDTO = new RecipientDTO();
		recipientDTO.setId(recipient.getId());
		recipientDTO.setName(recipient.getName());
		recipientDTO.setPhone(recipient.getPhone());
		recipientDTO.setEmail(recipient.getEmail());
		recipientDTO.setAddress(recipient.getAddress());
		recipientDTO.setProvince(recipient.getProvince());
		recipientDTO.setDistrict(recipient.getDistrict());
		recipientDTO.setWard(recipient.getWard());
		return recipientDTO;
	}

	private ShipmentItemResponse toShipmentItemResponse(ShipmentItem item) {
		return new ShipmentItemResponse(
				item.getId(),
				item.getProductName(),
				item.getSku(),
				item.getQuantity(),
				item.getPrice());
	}
}