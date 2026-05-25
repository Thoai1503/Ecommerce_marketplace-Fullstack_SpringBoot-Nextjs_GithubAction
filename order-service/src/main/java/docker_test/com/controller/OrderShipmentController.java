package docker_test.com.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.CancelShipmentByOosRequestDTO;
import docker_test.com.dto.CancelShipmentByOosResponseDTO;
import docker_test.com.dto.CancelShipmentRequestDTO;
import docker_test.com.dto.ConfirmReceivedResponseDTO;
import docker_test.com.dto.ConfirmPackagedResponseDTO;
import docker_test.com.dto.CreateAdjustmentRequestDTO;
import docker_test.com.dto.CreateAdjustmentResponseDTO;
import docker_test.com.dto.GetAdjustmentRequestDTO;
import docker_test.com.dto.OrderShipmentByShopResponseDTO;
import docker_test.com.dto.OrderShipmentResponeDTO;
import docker_test.com.service.OrderShipmentService;

@RestController
@RequestMapping("/api/orders/shipments")
public class OrderShipmentController {

	private final OrderShipmentService orderShipmentService;

	public OrderShipmentController(OrderShipmentService orderShipmentService) {
		this.orderShipmentService = orderShipmentService;
	}

	@GetMapping
	public ResponseEntity<Map<String, Object>> getAllShipments(
			@RequestParam(defaultValue = "ALL") String status,
			@RequestParam(defaultValue = "ALL") String paymentStatus,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "50") int size,
			@RequestParam(defaultValue = "desc") String sortOrder,
			@RequestParam(required = false) String sortBy,
			@RequestParam(required = false) String search
	) {
		return ResponseEntity.ok(orderShipmentService.getAllShipments(status, page, size, sortBy, sortOrder, search, paymentStatus));
	}

	@GetMapping("/shop/{shopId}")
	public ResponseEntity<Map<String, Object>> getShipmentsByShopId(@PathVariable Long shopId,
			@RequestParam(defaultValue = "ALL") String status,
			@RequestParam(defaultValue = "ALL") String paymentStatus,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "50") int size,
			@RequestParam(defaultValue = "desc") String sortOrder,
			@RequestParam(required = false) String sortBy,
			@RequestParam(required = false) String search
			
			) {
		System.out.println("Received request for shopId: " + shopId + ", status: " + status + ", paymentStatus: " + paymentStatus + ", page: " + page + ", size: " + size + ", sortOrder: " + sortOrder + ", sortBy: " + sortBy + ", search: " + search);
		return ResponseEntity.ok(orderShipmentService.getShipmentsByShopId(shopId, status, page, size, sortOrder, sortBy, search, paymentStatus));
	}
	@GetMapping("/{shipmentId}")
	public ResponseEntity<OrderShipmentResponeDTO> getShipmentById(@PathVariable Long shipmentId) {
		return ResponseEntity.ok(orderShipmentService.getShipmentById(shipmentId));
		}

	@PostMapping("/{shipmentId}/confirm-packaged")
	public ResponseEntity<ConfirmPackagedResponseDTO> confirmPackaged(@PathVariable Long shipmentId) {
		return ResponseEntity.ok(orderShipmentService.confirmPackagedAndRequestLogistics(shipmentId));
	}

	@PostMapping("/{shipmentId}/confirm-received")
	public ResponseEntity<ConfirmReceivedResponseDTO> confirmReceived(@PathVariable Long shipmentId) {
		return ResponseEntity.ok(orderShipmentService.confirmReceived(shipmentId));
	}

	@PostMapping("/{shipmentId}/adjustment-request")
	public ResponseEntity<CreateAdjustmentResponseDTO> createAdjustmentRequest(
			@PathVariable Long shipmentId,
			@RequestBody CreateAdjustmentRequestDTO request
	) {
		return ResponseEntity.ok(orderShipmentService.createAdjustmentRequest(shipmentId, request));
	}

	@GetMapping("/{shipmentId}/adjustment-request")
	public ResponseEntity<GetAdjustmentRequestDTO> getAdjustmentRequest(@PathVariable Long shipmentId) {
		GetAdjustmentRequestDTO result = orderShipmentService.getAdjustmentRequest(shipmentId);
		if (result == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(result);
	}

	@PostMapping("/{shipmentId}/cancel-by-oos")
	public ResponseEntity<CancelShipmentByOosResponseDTO> cancelByOutOfStock(
			@PathVariable Long shipmentId,
			@RequestBody CancelShipmentByOosRequestDTO request
	) {
		return ResponseEntity.ok(orderShipmentService.cancelShipmentByOutOfStock(shipmentId, request));
	}

	@PostMapping("/{shipmentId}/cancel")
	public ResponseEntity<CancelShipmentByOosResponseDTO> cancelPendingByBuyer(
			@PathVariable Long shipmentId,
			@RequestBody CancelShipmentRequestDTO request
	) {
		return ResponseEntity.ok(orderShipmentService.cancelPendingShipmentByBuyer(shipmentId, request));
	}

}
