package docker_test.com.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

	@GetMapping("/shop/{shopId}")
	public ResponseEntity<List<OrderShipmentByShopResponseDTO>> getShipmentsByShopId(@PathVariable Long shopId) {
		return ResponseEntity.ok(orderShipmentService.getShipmentsByShopId(shopId));
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
