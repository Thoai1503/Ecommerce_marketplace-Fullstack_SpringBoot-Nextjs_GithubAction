package docker_test.com.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderResponeDTO;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.models.OrderShipment;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderRepository;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.service.OrderService;
import jakarta.validation.Valid;

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
	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final OrderShipmentRepository orderShipmentRepository;

	public OrderController(OrderService orderService,
						   OrderRepository orderRepository,
						   OrderItemRepository orderItemRepository,
						   OrderShipmentRepository orderShipmentRepository) {
        this.orderService = orderService;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.orderShipmentRepository = orderShipmentRepository;
    }
 	
//	@PostMapping("")
//	public String placeOrder(@RequestBody OrderDTO order) {
//		System.out.println("Received order: " + order.getName() + ", Price: " + order.getTotal_price()) ;
//		var list = order.getOrders_items();
//		
//		var grououpedByShop = list.stream().collect(Collectors.groupingBy(OrderItemDTO::getShop_id));
//	    	grououpedByShop.forEach((shopId, items) -> {
//	            System.out.println("Shop ID: " + shopId);
//	            items.forEach(item -> {
//	                System.out.println("  Product ID: " + item.getProduct_id() + ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice() + ", Product Name: " + item.getProduct_name() + ", Variant Name: " + item.getVariant_name());
//	            });
//	        });
//	    	;
//		 grououpedByShop.entrySet().forEach(entry -> {
//	            Integer shopId = entry.getKey();
//	            System.out.println("Shop ID: " + shopId);
//	            entry.getValue().forEach(item -> {
//	                System.out.println("  Product ID: " + item.getProduct_id() + ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice() + ", Product Name: " + item.getProduct_name() + ", Variant Name: " + item.getVariant_name());
//	            });
//	     });
//
//		
//		
//		System.out.println("Grouped Order Items by Shop ID:" + grououpedByShop.toString());
//		
//		
//		
//		
//		
//		for(var item : list) {
//			System.out.println("Order Item - Product ID: " + item.getProduct_id() + ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice() + ", Shop ID: " + item.getShop_id() + ", Product Name: " + item.getProduct_name() + ", Variant Name: " + item.getVariant_name());
//		}
//		//sdsds
//		
//		 OrderCreatedEvent orderEvent = new OrderCreatedEvent();
//		 orderEvent.setRecipient(order.getRecipient());
//		 orderEvent.setStatus("PENDING");
//		 orderEvent.setMessage("order status is in pending state");
//		 orderEvent.setOrder(order);
//		 
//		System.out.println("Sending order event to Kafka: " + orderEvent.getMessage()); 
//		 orderProducer.sendMessage(orderEvent);
//		return "Order placed successfully ...";
//	}
	
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)           // return 201, not 200
    public ResponseEntity<OrderResponeDTO> placeOrder(@Valid @RequestBody OrderDTO dto) {
    	RecipientDTO recipient = dto.getRecipient();
    	System.out.println("Received order for recipient: " + recipient.getName() + ", Phone: " + recipient.getPhone());
        dto.getOrder_shipment().forEach(shipment -> {
			System.out.println("Shipment :" + shipment.toString());
		});
    	try {
    		
    		
    	OrderResponeDTO saved = orderService.placeOrder(dto);
    	System.out.println("Order placed successfully : " + saved.toString());
    	return ResponseEntity
    			.status(HttpStatus.CREATED)
    			.body(saved);
    	}
        catch (Exception e) {
			System.err.println("Error placing order: " + e.getMessage());
			
			//return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
			//giúp tôi trả về cả message lỗi trong response body
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new OrderResponeDTO(null, null, "Failed to place order: " + e.getMessage()));
		}
    }

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