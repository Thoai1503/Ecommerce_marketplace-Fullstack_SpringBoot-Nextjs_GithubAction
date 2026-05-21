package docker_test.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import docker_test.com.dto.RefundedToOrderServiceDTO;
import docker_test.com.service.ApprovedReturnService;

@Component
public class ApprovedReturnRequest {
	private static final Logger log = LoggerFactory.getLogger(ApprovedReturnRequest.class);
    private final ApprovedReturnService approvedReturnService;
    
    public ApprovedReturnRequest(ApprovedReturnService approvedReturnService) {
		this.approvedReturnService = approvedReturnService;
	}
    
    
    @KafkaListener(
			topics = "${spring.kafka.topic.return-request:refunded_to_order_service}",
			groupId = "${spring.kafka.consumer.group-id.return-request:order-service-return-request-group}",
			properties = {
				"spring.json.use.type.headers=false",
				"spring.json.value.default.type=docker_test.com.dto.RefundedToOrderServiceDTO"
			}
	)
    public void consumeApprovedReturnRequest(RefundedToOrderServiceDTO event) {
		log.info("Received approved return request event: {}", event);
		log.info("RefundCalled= {}",event.getRefundCalculationResult().toString());
		approvedReturnService.processApprovedReturn(event);
		
		
    }
		
}
