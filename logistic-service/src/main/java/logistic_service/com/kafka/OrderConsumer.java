package logistic_service.com.kafka;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import logistic_service.com.entities.Recipient;
import logistic_service.com.entities.Shipment;
import logistic_service.com.models.OrderCreatedEvent;
import logistic_service.com.repositories.RecipientRepository;
import logistic_service.com.services.ShipmentService;


@Service
public class OrderConsumer {

	 private static final Logger LOGGER = LoggerFactory.getLogger(OrderConsumer.class);
	 private final ShipmentService shipmentService;
	 private final RecipientRepository recipientRepository;
	 
	 public OrderConsumer(ShipmentService shipmentService, RecipientRepository recipientRepository) {
		 this.shipmentService = shipmentService;
		 this.recipientRepository = recipientRepository;
	 }
	 
	 @KafkaListener(topics = "${spring.kafka.topic.name}",groupId = "${spring.kafka.consumer.group-id}")
	 public void consume(OrderCreatedEvent event) {
		 var order = event.getOrder();

		 
        var recipientDTO = event.getOrder().getRecipient();
	
        Recipient recipient = recipientRepository.findByPhone(recipientDTO.getPhone())
        	    .orElseGet(() -> {
        	        Recipient r = new Recipient();
        	        r.setName(recipientDTO.getName());
        	        r.setPhone(recipientDTO.getPhone());
        	        r.setAddress(recipientDTO.getAddress());
        	        r.setEmail("vpthpo@gmail.com");
        	        r.setProvince(recipientDTO.getProvince());
        	        r.setDistrict(recipientDTO.getDistrict());
        	        r.setWard(recipientDTO.getWard());
        	        return recipientRepository.save(r);
        	    });
            LOGGER.info("Recipient saved => {}", recipient);
		 
		 System.out.println("✅ Received OK: Order  => " + order.toString());

	
	

		 System.out.println("✅ Received OK: Order  => " + order.toString());
//		 var orderItems = order.getOrders_items();
//		 for(var item: orderItems) {
//			 LOGGER.info(String.format("Order item => %s", item.toString()));
//
//		 }
//		
//		 order.getOrders_items().forEach(item -> {
//			 LOGGER.info(String.format("Order item => %s", item.toString()));
//		 });
		 order.getOrders_items().stream().forEach(item -> {
			 LOGGER.info(String.format("Order item => %s", item.toString()));

		 });

		LOGGER.info(String.format("Order event recieved in stock service => %s", event.toString())); 
		//group order item by shop id
		order.getOrders_items().stream().forEach(item -> {
			LOGGER.info(String.format("Processing order item => %s", item.toString()));
			Shipment shipment = new Shipment();
			shipment.setOrderRefId(order.getId().toString());
			shipment.setShopRefId(item.getShop_id().toString());
			shipment.setTrackingCode("LOG"+order.getId().toString()+item.getProduct_id().toString()+UUID.randomUUID().toString().substring(0, 5).toUpperCase());
			shipment.setShippingFee(item.getPrice()*item.getQuantity()*0.1); // 10% of total price as shipping fee
			shipment.setPartnerId(1);
           
		shipment.setRecipient(recipient);
			
			
		var shm =	shipmentService.createShipment(shipment);
		
			LOGGER.info(String.format("Shipment created => %s", shm.toString()));
		
		});
		
		
		
	 }
	 
	 
}
