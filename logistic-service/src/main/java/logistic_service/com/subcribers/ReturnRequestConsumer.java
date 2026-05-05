package logistic_service.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import logistic_service.com.dto.RefundRequestDTO;


@Service
public class ReturnRequestConsumer {
   private static final Logger LOGGER = LoggerFactory.getLogger(ReturnRequestConsumer.class);
   
   @KafkaListener(
		   topics = "return_request_to_logistic",
		   groupId = "${spring.kafka.consumer.group-id}",
		   containerFactory = "refundKafkaListenerContainerFactory"
	)
   public void consume(RefundRequestDTO refundRequest) {
	   LOGGER.info("Received return request message: {}", refundRequest);
	   if (refundRequest.getItems() == null) {
		   LOGGER.warn("Return request has no items");
		   return;
	   }

	   refundRequest.getItems().forEach(item -> {
		   LOGGER.info("Return item: productId={}, quantity={}", item.getOrderItemId(), item.getQuantity());
	   });
	   // Here you would typically deserialize the message and process it accordingly
   }
   
   
}
