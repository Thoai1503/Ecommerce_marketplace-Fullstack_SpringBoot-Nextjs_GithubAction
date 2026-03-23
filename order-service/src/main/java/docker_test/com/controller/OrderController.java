package docker_test.com.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderCreatedEvent;
import docker_test.com.kafka.OrderProducer;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
   
	private  OrderProducer orderProducer;
 	
 	public OrderController (OrderProducer orderProducer) {
 		this.orderProducer =orderProducer;
 	}
	
	@PostMapping("")
	public String placeOrder(@RequestBody OrderDTO order) {
		System.out.println("Received order: " + order.getName() + ", Price: " + order.getTotal_price()) ;
		var list = order.getOrders_items();
		
		for(var item : list) {
			System.out.println("Order Item - Product ID: " + item.getProduct_id() + ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice());
		}
		
		 OrderCreatedEvent orderEvent = new OrderCreatedEvent();
		 orderEvent.setStatus("PENDING");
		 orderEvent.setMessage("order status is in pending state");
		 orderEvent.setOrder(order);
		System.out.println("Sending order event to Kafka: " + orderEvent.getMessage()); 
		 orderProducer.sendMessage(orderEvent);
		return "Order placed successfully ...";
	}
}
