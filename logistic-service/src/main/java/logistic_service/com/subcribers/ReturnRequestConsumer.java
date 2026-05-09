package logistic_service.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import logistic_service.com.dto.RefundRequestDTO;
import logistic_service.com.entities.Shipment;
import logistic_service.com.services.ReturnRequestLogisticService;


@Service
public class ReturnRequestConsumer {
   private static final Logger LOGGER = LoggerFactory.getLogger(ReturnRequestConsumer.class);
   private final ReturnRequestLogisticService returnRequestLogisticService;

   public ReturnRequestConsumer(ReturnRequestLogisticService returnRequestLogisticService) {
	   this.returnRequestLogisticService = returnRequestLogisticService;
	}
   
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

	   Shipment shipment = returnRequestLogisticService.createReturnShipment(refundRequest);
	   LOGGER.info(
		   "Created/loaded return shipment id={} trackingCode={} for returnRequestId={}",
		   shipment.getId(),
		   shipment.getTrackingCode(),
		   refundRequest.getReturnRequestId()
	   );
   }
   
   
}
