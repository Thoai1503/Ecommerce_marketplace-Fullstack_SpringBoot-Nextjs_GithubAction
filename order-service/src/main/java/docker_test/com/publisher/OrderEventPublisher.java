package docker_test.com.publisher;

import docker_test.com.dto.OrderCreatedEvent;
import docker_test.com.dto.OrderDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    @Value("${spring.kafka.topic.name}")
    private String topicName;  // inject topic name, don't hardcode it

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(OrderDTO dto) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrder(dto);
        event.setStatus("PENDING");
        event.setMessage("Order status is in pending state");

        log.info("Publishing order_created event for order_id={}", dto.getId());

        kafkaTemplate.send(topicName, String.valueOf(dto.getId()), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Event sent OK offset={}",
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to send event for order_id={}", dto.getId(), ex);
                    }
                });
    }
}