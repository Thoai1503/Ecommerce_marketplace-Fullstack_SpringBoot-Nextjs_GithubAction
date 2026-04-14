package logistic_service.com.publisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import logistic_service.com.dto.ShipmentStatusUpdatedEvent;


@Component
public class OrderStatusPublisher {
	 private static final Logger log = LoggerFactory.getLogger(OrderStatusPublisher.class);
	   private final KafkaTemplate<String, Object> kafkaTemplate;
	   public OrderStatusPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
		   this.kafkaTemplate = kafkaTemplate;
	   }
	   
	   public void publish(Object object) {
		   kafkaTemplate.send("update_order_status", object);
	   }
       
	   public void publishShipmentStatusUpdated(ShipmentStatusUpdatedEvent event) {
		   log.info("Publishing shipment status update: trackingCode={}, status={}", event.trackingCode(), event.status());
		   kafkaTemplate.send("update_shipment_status", event.trackingCode(), event);
	   }
	 
}
