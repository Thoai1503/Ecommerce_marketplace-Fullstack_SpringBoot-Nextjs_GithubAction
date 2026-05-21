package docker_test.com.subcribers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import docker_test.com.dto.ShipmentStatusUpdatedEvent;
import docker_test.com.service.OrderShipmentService;

@Component
public class ShipmentStatusSubscriber {

    private static final Logger log = LoggerFactory.getLogger(ShipmentStatusSubscriber.class);

    private final OrderShipmentService orderShipmentService;

    public ShipmentStatusSubscriber(OrderShipmentService orderShipmentService) {
        this.orderShipmentService = orderShipmentService;
    }

    @KafkaListener(
            topics = "${spring.kafka.topic.shipment-status:update_shipment_status}",
            groupId = "${spring.kafka.consumer.group-id.shipment-status:order-service-shipment-status-group}",
            properties = {
                "spring.json.use.type.headers=false",
                "spring.json.value.default.type=docker_test.com.dto.ShipmentStatusUpdatedEvent"
            }
    )
    public void consumeShipmentStatusUpdate(ShipmentStatusUpdatedEvent event) {
        log.info("Received shipment status event trackingCode={}, status={}", event.getTrackingCode(), event.getStatus());
        if(!event.getTrackingCode().startsWith("RET")) {
        orderShipmentService.applyShipmentStatusEvent(event);
        }
    }
}
