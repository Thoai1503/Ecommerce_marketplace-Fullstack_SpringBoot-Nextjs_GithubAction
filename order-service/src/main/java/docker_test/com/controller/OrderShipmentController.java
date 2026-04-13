package docker_test.com.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.ConfirmPackagedResponseDTO;
import docker_test.com.dto.OrderShipmentByShopResponseDTO;
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

	@PostMapping("/{shipmentId}/confirm-packaged")
	public ResponseEntity<ConfirmPackagedResponseDTO> confirmPackaged(@PathVariable Long shipmentId) {
		return ResponseEntity.ok(orderShipmentService.confirmPackagedAndRequestLogistics(shipmentId));
	}

}
