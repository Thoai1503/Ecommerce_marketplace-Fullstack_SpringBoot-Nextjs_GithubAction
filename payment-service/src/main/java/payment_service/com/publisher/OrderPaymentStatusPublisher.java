package payment_service.com.publisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Publishes payment status update events to Kafka topic "update_payment_status".
 *
 * <p>The Kafka producer is configured with StringSerializer; this publisher
 * serializes any payload to a JSON string before sending.
 */
@Component
public class OrderPaymentStatusPublisher {

    private static final String TOPIC_NAME = "update_payment_status";
    private static final Logger LOG = LoggerFactory.getLogger(OrderPaymentStatusPublisher.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public OrderPaymentStatusPublisher(KafkaTemplate<String, String> kafkaTemplate,
                                       ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Serialize {@code payload} to JSON and publish to Kafka.
     *
     * @param payload any serializable object
     */
    public void publish(Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            LOG.info("Publishing payment status update to topic={}: {}", TOPIC_NAME, json);
            kafkaTemplate.send(TOPIC_NAME, json);
        } catch (JsonProcessingException e) {
            LOG.error("Failed to serialize payment status payload: {}", e.getMessage(), e);
            throw new IllegalStateException("Cannot serialize payment event payload", e);
        }
    }
}
