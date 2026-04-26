package docker_test.com.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderPageResponse;
import docker_test.com.dto.OrderResponeDTO;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.dto.AdminOrderListItemDTO;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.models.OrderShipment;
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
   
//	private  OrderProducer orderProducer;
// 	
// 	public OrderController (OrderProducer orderProducer) {
// 		this.orderProducer =orderProducer;
// 	}

    private final OrderService orderService;
	private final OrdersRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final OrderShipmentRepository orderShipmentRepository;
	
	    private final AdminOrderService adminOrderService;

	public OrderController(OrderService orderService,
						   OrdersRepository orderRepository,
						   OrderItemRepository orderItemRepository,
						   OrderShipmentRepository orderShipmentRepository,
						   AdminOrderService adminOrderService) {
        this.orderService = orderService;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.orderShipmentRepository = orderShipmentRepository;
		this.adminOrderService = adminOrderService;
    }
	
	  @PostMapping("/create")
	    public ResponseEntity<?> create(@RequestBody Order item) {
	        try {
	            return ResponseEntity.ok(orderRepository.save(item));
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(java.util.Map.of("message", "Create order failed", "error", e.getMessage()));
	        }
	    }

	    @GetMapping("")
	    public OrderPageResponse<AdminOrderListItemDTO> getOrders(
	            @RequestParam(required = false) Long userId,
	            @RequestParam(required = false) String startDate,
	            @RequestParam(required = false) String endDate,
	            @RequestParam(required = false) Double minAmount,
	            @RequestParam(required = false) Double maxAmount,
	            @RequestParam(defaultValue = "all") String status,
	            @RequestParam(defaultValue = "date") String sortBy,
	            @RequestParam(defaultValue = "desc") String sortOrder,
	            @RequestParam(defaultValue = "1") int page,
	            @RequestParam(defaultValue = "10") int size
	    ) {

	        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
	        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

	        return adminOrderService.getAdminOrders(
	                userId,
	                start,
	                end,
	                minAmount,
	                maxAmount,
	                status,
	                sortBy,
	                sortOrder,
	                page,
	                size
	        );
	    }

//	    @GetMapping("/{id}")
//	    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
//	        Order order = adminOrderService.getAdminOrderById(id);
//	        if (order == null) {
//	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//	                    .body(java.util.Map.of("message", "Order not found", "id", id));
//	        }
//	        return ResponseEntity.ok(order);
//	    }

	@GetMapping("/{id}")
	public ResponseEntity<?> getOrderById(@PathVariable Long id) {
		Order order = orderRepository.findById(id).orElse(null);
		if (order == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "Order not found", "id", id));
		}

		List<OrderItem> items = orderItemRepository.findByOrderId(id);
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
		response.put("items", items);
		response.put("shipments", shipments);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}/items")
	public ResponseEntity<?> getOrderItems(@PathVariable Long id) {
		if (!orderRepository.existsById(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "Order not found", "id", id));
		}
		return ResponseEntity.ok(orderItemRepository.findByOrderId(id));
	}
	
	
	
	   public record OrderResponseDTO(Long id, String orderNumber, String status) {}
}