package docker_test.com.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.model.Order;
import docker_test.com.service.OrderService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
   
//	private  OrderProducer orderProducer;
// 	
// 	public OrderController (OrderProducer orderProducer) {
// 		this.orderProducer =orderProducer;
// 	}

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
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
    public ResponseEntity<OrderResponseDTO> placeOrder(@Valid @RequestBody OrderDTO dto) {
    	RecipientDTO recipient = dto.getRecipient();
    	System.out.println("Received order for recipient: " + recipient.getName() + ", Phone: " + recipient.getPhone());
        
    	try {
    	Order saved = orderService.placeOrder(dto);
    	return ResponseEntity
    			.status(HttpStatus.CREATED)
    			.body(new OrderResponseDTO(saved.getId(), saved.getOrderNumber(), "PENDING"));
    	}
        catch (Exception e) {
			System.err.println("Error placing order: " + e.getMessage());
			
			//return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
			//giúp tôi trả về cả message lỗi trong response body
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new OrderResponseDTO(null, null, "ERROR: " + e.getMessage()));
		}
    }
	
	
	
	   public record OrderResponseDTO(Long id, String orderNumber, String status) {}
}
