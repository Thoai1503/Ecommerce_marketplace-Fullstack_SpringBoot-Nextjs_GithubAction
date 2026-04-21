package docker_test.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class OrderPaymentStatusSubcriber {
	private static final Logger log = LoggerFactory.getLogger(OrderPaymentStatusSubcriber.class);
	
	@org.springframework.kafka.annotation.KafkaListener(
			topics = "${spring.kafka.topic.payment-status:update_payment_status}",
			groupId = "${spring.kafka.consumer.group-id:order-service-payment-status-group}"
	)
	public void consumePaymentStatusUpdate(Object event) {
		log.info("Received payment status update: {}", event);
		
		// Here you would typically call a service to update the order's payment status in your database
	}
}
