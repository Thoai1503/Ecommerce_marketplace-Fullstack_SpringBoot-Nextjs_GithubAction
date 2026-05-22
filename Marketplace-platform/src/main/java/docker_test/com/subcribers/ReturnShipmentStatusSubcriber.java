package docker_test.com.subcribers;

import java.util.Optional;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import docker_test.com.dto.ReturnShipmentStatusUpdatedEvent;
import docker_test.com.models.ReturnShipment;
import docker_test.com.models.ReturnShipmentStatus;
import docker_test.com.repository.ReturnShipmentRepository;

@Component
public class ReturnShipmentStatusSubcriber {
     private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ReturnShipmentStatusSubcriber.class);
     private final ReturnShipmentRepository returnShipmentRepository;
     
     
     public ReturnShipmentStatusSubcriber(ReturnShipmentRepository returnShipmentRepository) {
		 this.returnShipmentRepository = returnShipmentRepository;
	 }
     
     @KafkaListener(
             topics = "${spring.kafka.topic.shipment-status:update_shipment_status}",
             groupId = "${spring.kafka.consumer.group-id.shipment-status:return-shipment-status-group}",
             properties = {
                     "spring.json.use.type.headers=false",
                     "spring.json.value.default.type=docker_test.com.dto.ReturnShipmentStatusUpdatedEvent"
             }
     )
     public void consumeShipmentStatusUpdate(ReturnShipmentStatusUpdatedEvent event) {
         log.info("Received return shipment status event trackingCode={}, status={}, shipmentId={}", event.getTrackingCode(), event.getStatus(), event.getShipmentId());
		  // Here you can add logic to update the return shipment status in your database or perform other actions as needed
                ReturnShipmentStatus newStatus;
                try {
                        newStatus = ReturnShipmentStatus.valueOf(event.getStatus().trim().toUpperCase());
                } catch (RuntimeException ex) {
                        log.warn("Invalid return shipment status '{}' for shipmentId={}", event.getStatus(), event.getShipmentId());
                        return;
                }

        Optional<ReturnShipment> optionalReturnShipment = returnShipmentRepository.findById(event.getShipmentId());
        
        
        if (optionalReturnShipment.isPresent()) {
			ReturnShipment returnShipment = optionalReturnShipment.get();
                        returnShipment.setStatus(newStatus);
			returnShipment.setTrackingCode(event.getTrackingCode());
			returnShipmentRepository.save(returnShipment);
			log.info("Updated return shipment id={} with new status={}", returnShipment.getId(), returnShipment.getStatus());
		} else {
			log.warn("Return shipment with id={} not found for status update", event.getShipmentId());
		}
         
         
     }
}

