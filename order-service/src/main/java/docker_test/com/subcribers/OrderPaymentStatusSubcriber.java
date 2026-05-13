package docker_test.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import docker_test.com.dto.PaymentStatusUpdatedEvent;
import docker_test.com.service.OrderService;

@Component
public class OrderPaymentStatusSubcriber {
	private static final Logger log = LoggerFactory.getLogger(OrderPaymentStatusSubcriber.class);
	private final OrderService orderService;

	public OrderPaymentStatusSubcriber(OrderService orderService) {
		this.orderService = orderService;
	}
	
	@org.springframework.kafka.annotation.KafkaListener(
			topics = "${spring.kafka.topic.payment-status:update_payment_status}",
			groupId = "${spring.kafka.consumer.group-id.payment-status:order-service-payment-status-group}",
			properties = {
				"spring.json.use.type.headers=false",
				"spring.json.value.default.type=docker_test.com.dto.PaymentStatusUpdatedEvent"
			}
	)
	public void consumePaymentStatusUpdate(PaymentStatusUpdatedEvent event) {
		log.info("Received payment status event orderId={}, txnRef={}, success={}, responseCode={}",
				event.getOrderId(), event.getTxnRef(), event.getSuccess(), event.getResponseCode());
		orderService.applyPaymentStatusEvent(event);
	}
}
