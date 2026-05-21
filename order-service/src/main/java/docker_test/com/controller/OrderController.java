 package docker_test.com.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.dto.AdminOrderListItemDTO;
import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderPageResponse;
import docker_test.com.dto.OrderResponeDTO;
import docker_test.com.dto.RecipientDTO;

import docker_test.com.model.Order;
import docker_test.com.model.OrderShipment;

import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrdersRepository;
import docker_test.com.repository.OrderShipmentRepository;

import docker_test.com.service.AdminOrderService;
import docker_test.com.service.OrderService;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;
	private final OrdersRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final OrderShipmentRepository orderShipmentRepository;
	private final AdminOrderService adminOrderService;

	public OrderController(OrderService orderService, OrdersRepository orderRepository,
			OrderItemRepository orderItemRepository, OrderShipmentRepository orderShipmentRepository,
			AdminOrderService adminOrderService) {
		this.orderService = orderService;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.orderShipmentRepository = orderShipmentRepository;
		this.adminOrderService = adminOrderService;
	}

	@PostMapping
	public ResponseEntity<OrderResponeDTO> placeOrder(@Valid @RequestBody OrderDTO dto) {
		dto.getOrder_shipment().forEach(shipment -> 
		{
			if(shipment.getVoucher_id() != null) {
			shipment.getVoucher_id().forEach(voucherId -> System.out.println("Shipment " + shipment.getOrder_id() + " has voucher ID: " + voucherId));
			} 
		}
		
				);
		try {
			RecipientDTO recipient = dto.getRecipient();

			if (recipient == null) {
				return ResponseEntity.badRequest().body(new OrderResponeDTO(null, null, "Recipient is required"));
			}

			if (dto.getOrders_items() == null || dto.getOrders_items().isEmpty()) {
				return ResponseEntity.badRequest().body(new OrderResponeDTO(null, null, "Order items is required"));
			}

			if (dto.getOrder_shipment() == null || dto.getOrder_shipment().isEmpty()) {
				return ResponseEntity.badRequest().body(new OrderResponeDTO(null, null, "Order shipment is required"));
			}

			System.out.println(
					"Received order for recipient: " + recipient.getName() + ", Phone: " + recipient.getPhone());

			dto.getOrder_shipment().forEach(shipment -> System.out.println("Shipment: " + shipment));

			OrderResponeDTO saved = orderService.placeOrder(dto);
			System.out.println("Order placed successfully: " + saved);

			return ResponseEntity.status(HttpStatus.CREATED).body(saved);

		} catch (Exception e) {
			System.err.println("Error placing order: " + e.getMessage());

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new OrderResponeDTO(null, null, "Failed to place order: " + e.getMessage()));
		}
	}

	@PostMapping("/create")
	public ResponseEntity<?> create(@RequestBody Order item) {
		try {
			return ResponseEntity.ok(orderRepository.save(item));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Create order failed", "error", e.getMessage()));
		}
	}

	@GetMapping
	public OrderPageResponse<AdminOrderListItemDTO> getOrders(@RequestParam(required = false) Long userId,
			@RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate,
			@RequestParam(required = false) Double minAmount, @RequestParam(required = false) Double maxAmount,
			@RequestParam(defaultValue = "all") String status, @RequestParam(defaultValue = "date") String sortBy,
			@RequestParam(defaultValue = "desc") String sortOrder, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
		LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

		return adminOrderService.getAdminOrders(userId, start, end, minAmount, maxAmount, status, sortBy, sortOrder,
				page, size);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getOrderById(@PathVariable Long id) {
		Order order = orderRepository.findById(id).orElse(null);

		if (order == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found", "id", id));
		}

		List<docker_test.com.model.OrderItem> items = orderItemRepository.findByOrderId(id);

		List<OrderShipment> shipments = orderShipmentRepository.findByOrderIdOrderByIdDesc(id);

		Map<String, Object> response = new LinkedHashMap<>();

		response.put("id", order.getId());
		response.put("orderId", order.getId());
		response.put("orderNumber", order.getOrderNumber());
		response.put("userId", order.getUserId());
		response.put("addressId", order.getAddressId());
		response.put("totalAmount", order.getTotalAmount());
		response.put("shippingFee", order.getShippingFee());
		response.put("discountAmount", order.getDiscountAmount());
		response.put("finalAmount", order.getFinalAmount());
		response.put("paymentMethod", order.getPaymentMethod());
		response.put("paymentStatus", order.getPaymentStatus());
		response.put("orderStatus", order.getOrderStatus());
		response.put("trackingNumber", order.getTrackingNumber());
		response.put("returnStatusSummary", order.getReturnStatusSummary());
		response.put("lastReturnRequestId", order.getLastReturnRequestId());
		response.put("items", items);
		response.put("shipments", shipments);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}/items")
	public ResponseEntity<?> getOrderItems(@PathVariable Long id) {
		if (!orderRepository.existsById(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found", "id", id));
		}

		return ResponseEntity.ok(orderItemRepository.findByOrderId(id));
	}

	public record OrderResponseDTO(Long id, String orderNumber, String status) {
	}
}