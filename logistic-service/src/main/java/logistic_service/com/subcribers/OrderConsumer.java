package logistic_service.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import logistic_service.com.dto.OrderCreatedEvent;
import logistic_service.com.services.OrderCreatedService;
import logistic_service.com.services.RecipientCreatingService;


@Service
public class OrderConsumer {

	 private static final Logger LOGGER = LoggerFactory.getLogger(OrderConsumer.class);
	 private final RecipientCreatingService creatingService;
	 private final OrderCreatedService orderCreatedService;
	 public OrderConsumer (RecipientCreatingService creatingService, OrderCreatedService orderCreatedService) {
		 this.creatingService =creatingService;
		 this.orderCreatedService =orderCreatedService;
	 }
	 
	 
	 @Transactional(rollbackFor = Exception.class)
	 @KafkaListener(topics = "${spring.kafka.topic.name}",groupId = "${spring.kafka.consumer.group-id}")
	 public void consume(OrderCreatedEvent event) {
		 var order = event.getOrder();
		 LOGGER.info("Recieved order => {}",order.toString());
		 LOGGER.info("Reci : {}",order.getRecipient().toString());
		
	     var createdRecipient =	 creatingService.createRecipient(order.getRecipient());
		order.getRecipient().setId(createdRecipient.getId());
		
		orderCreatedService.createShipment(order);
	     
		 
		 System.out.println("✅ Received OK: Order  => " + order.toString());

		 order.getOrders_items().stream().forEach(item -> {
			 LOGGER.info(String.format("Order item => %s", item.toString()));

		 });
		LOGGER.info(String.format("Order event recieved in stock service => %s", event.toString())); 
		LOGGER.info("End");
	 }
	 
	 
}
