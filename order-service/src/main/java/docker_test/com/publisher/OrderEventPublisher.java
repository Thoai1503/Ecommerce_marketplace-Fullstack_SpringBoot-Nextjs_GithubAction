package docker_test.com.publisher;

import docker_test.com.dto.OrderCreatedEvent;
import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderItem;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    @Value("${spring.kafka.topic.order-created.name}")
    private String orderCreatedTopicName;

    @Value("${spring.kafka.topic.stock-update.name}")
    private String stockUpdateTopicName;
    
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    
    private final KafkaTemplate<String, OrderItem> stockUpdateKafkaTemplate;
    
    public OrderEventPublisher(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate, KafkaTemplate<String, OrderItem> stockUpdateKafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.stockUpdateKafkaTemplate = stockUpdateKafkaTemplate;
    }

    public void publish(OrderDTO dto) {
        OrderCreatedEvent event = new OrderCreatedEvent();
       // var recipient = dto.getRecipient();
        
        
        event.setOrder(dto);
        event.setStatus("PENDING");
        event.setMessage("Order status is in pending state");

        log.info("Publishing order_created event for order_id={}", dto.getId());
        kafkaTemplate.send(orderCreatedTopicName, String.valueOf(dto.getId()), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Event sent OK offset={}",
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send event for order_id={}", dto.getId(), ex);
                    }
                });
    }
    
    public void publishStockUpdate(OrderItem items) {
		log.info("Publishing stock update event for order items={}", items);
        stockUpdateKafkaTemplate.send(stockUpdateTopicName, String.valueOf(items.getVariant_id()), items)
		.whenComplete((result, ex) -> {
			if (ex == null) {
				log.info("Stock update event sent OK offset={}",
						result.getRecordMetadata().offset());
			} else {
				log.error("Failed to send stock update event for variant_id={}", items.getVariant_id(), ex);
			}
		});
    }

    	
    
    
}