package docker_test.com.kafka;
import java.util.UUID;

import org.apache.kafka.clients.admin.NewTopic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

//import base_domain.com.dto.OrderEvent;
import docker_test.com.dto.OrderCreatedEvent;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderRepository;

@Service
public class OrderProducer {
	private static final Logger LOGGER = LoggerFactory.getLogger(OrderProducer.class);
	
    private NewTopic newTopic;
    
    private final OrderRepository orderRepository;
    
    private final OrderItemRepository orderItemRepository;
    
    
    private KafkaTemplate<String,String> kafkaTemplate;

	 public OrderProducer(NewTopic newTopic, KafkaTemplate<String, String> kafkaTemplate,OrderRepository orderRepository,OrderItemRepository orderItemRepository) {
		super();
		this.newTopic = newTopic;
		this.kafkaTemplate = kafkaTemplate;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
	 }
	 
	 public void sendMessage(OrderCreatedEvent event) {
		 LOGGER.info(String.format("Order event => %s", event.toString()));
		 LOGGER.info(String.format("Order data => %s", event.getOrder().toString()));
		 var order = new Order();
		 	
		 order.setAddressId(event.getOrder().getAddress_id());
		 order.setDiscountAmount(event.getOrder().getDiscount_amount());
		 order.setOrderNumber(event.getOrder().getOrder_number()+UUID.randomUUID().toString().toUpperCase().substring(0, 8));
		 order.setFinalAmount(event.getOrder().getFinal_amount());
		 order.setTotalAmount(event.getOrder().getTotal_price());
		 order.setOrderStatus("PENDING");
		 order.setPaymentMethod(event.getOrder().getPayment_method());
		 order.setPaymentStatus("PENDING");
		 order.setOrderStatus(event.getStatus());
		 order.setPaymentMethod(event.getOrder().getPayment_method());
		 order.setShippingFee(event.getOrder().getShipping_fee());
		 order.setUserId(event.getOrder().getUser_id());
		 
		  
		 var savedOrder = orderRepository.save(order);
		 System.out.println("Order saved to database with ID: " + savedOrder.getId());
		 
		 event.getOrder().setId(savedOrder.getId());
		 event.getOrder().setOrder_number(savedOrder.getOrderNumber());
		 event.setStatus("PENDING");
//		 
//		 Message<OrderCreatedEvent> message	= MessageBuilder
//				 .withPayload(event)
//				 .setHeader(KafkaHeaders.TOPIC, newTopic.name())
//				 .build();
//		 kafkaTemplate.send(message);	
		 var orderItems = event.getOrder().getOrders_items();
		 
		 orderItems.forEach(item -> {
			 var orderItem = new OrderItem();
			 orderItem.setOrderId(savedOrder.getId());
			 orderItem.setPrice(item.getPrice());
			 orderItem.setProductName(item.getProduct_name());
			 orderItem.setVariantName(item.getVariant_name());
			 orderItem.setTotalPrice(item.getPrice() * item.getQuantity());
			 orderItem.setProductId(item.getProduct_id());
			 orderItem.setVariantId(item.getVariant_id());
			 orderItem.setQuantity(item.getQuantity());
			 var savedOrderItem=  orderItemRepository.save(orderItem);
			 System.out.println("Order item saved to database with ID: " + savedOrderItem.toString());
			 item.setId(savedOrderItem.getId());
		 });
		 
		 

		 kafkaTemplate.send("order_created", "HELLO")
		    .whenComplete((result, ex) -> {
		        if (ex == null) {
		            System.out.println("✅ Sent OK: " + result.getRecordMetadata());
		        } else {
		            System.err.println("❌ SEND FAILED");
		            ex.printStackTrace();
		        }
		    });
	 }
}	



