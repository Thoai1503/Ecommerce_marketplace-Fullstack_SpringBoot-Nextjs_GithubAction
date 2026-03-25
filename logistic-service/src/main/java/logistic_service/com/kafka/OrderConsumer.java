package logistic_service.com.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import logistic_service.com.models.OrderCreatedEvent;


@Service
public class OrderConsumer {

	 private static final Logger LOGGER = LoggerFactory.getLogger(OrderConsumer.class);
	 
	 
	 @KafkaListener(topics = "${spring.kafka.topic.name}",groupId = "${spring.kafka.consumer.group-id}")
	 public void consume(OrderCreatedEvent event) {
		 var order = event.getOrder();
		 System.out.println("✅ Received OK: Order  => " + order.toString());
//		 var orderItems = order.getOrders_items();
//		 for(var item: orderItems) {
//			 LOGGER.info(String.format("Order item => %s", item.toString()));
//
//		 }
//		
//		 order.getOrders_items().forEach(item -> {
//			 LOGGER.info(String.format("Order item => %s", item.toString()));
//		 });
		 order.getOrders_items().stream().forEach(item -> {
			 LOGGER.info(String.format("Order item => %s", item.toString()));

		 });
		LOGGER.info(String.format("Order event recieved in stock service => %s", event.toString())); 
	 }
	 
	 
}
