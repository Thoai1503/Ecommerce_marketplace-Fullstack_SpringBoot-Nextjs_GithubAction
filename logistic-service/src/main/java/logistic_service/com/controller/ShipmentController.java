package logistic_service.com.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import logistic_service.com.dto.PageResponse;
import logistic_service.com.dto.ShipmentSummaryResponse;
import logistic_service.com.dto.ShipmentTrackingDetailResponse;
import logistic_service.com.dto.ShipmentTimelineResponse;
import logistic_service.com.dto.ShipmentStatusUpdateResponse;
import logistic_service.com.dto.ShipmentStatusUpdateRequest;
import logistic_service.com.entities.Shipment;
import logistic_service.com.enums.ShipmentStatus;
import logistic_service.com.services.ShipmentService;

@RestController
@RequestMapping("/api/logistics")
public class ShipmentController {
	private final ShipmentService shipmentService;

	public ShipmentController(ShipmentService shipmentService) {
		this.shipmentService = shipmentService;
	}

    @GetMapping
    public String greating() {
    	return "Logistic service is running...";
    }

    @PostMapping("/shipments")
    public ResponseEntity<?> updateShipmentStatus(@RequestBody ShipmentStatusUpdateRequest request) {
		try {
			Shipment updatedShipment = shipmentService.updateStatusByOrderShipmentRefId(
					request.orderShipmentRefId(), request.status());
			ShipmentStatusUpdateResponse response = new ShipmentStatusUpdateResponse(
					updatedShipment.getId(),
					updatedShipment.getOrderShipmentRefId(),
					updatedShipment.getTrackingCode(),
					updatedShipment.getStatus(),
					"Shipment status updated successfully"
			);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}

	@GetMapping("/shipments")
	public ResponseEntity<PageResponse<ShipmentSummaryResponse>> getShipments(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) ShipmentStatus status,
			@RequestParam(required = false) String trackingCode,
			@RequestParam(required = false) Long shopRefId) {
		PageResponse<ShipmentSummaryResponse> response = shipmentService.getShipments(
				page,
				size,
				status,
				trackingCode,
				shopRefId
		);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/shipments/tracking/{trackingCode}")
	public ResponseEntity<?> getShipmentByTrackingCode(@PathVariable String trackingCode) {
		try {
			ShipmentTrackingDetailResponse response = shipmentService.getByTrackingCode(trackingCode);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}

	@GetMapping("/shipments/{shipmentId}/timeline")
	public ResponseEntity<?> getShipmentTimeline(@PathVariable Long shipmentId) {
		try {
			List<ShipmentTimelineResponse> response = shipmentService.getTimelineByShipmentId(shipmentId);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}
}
