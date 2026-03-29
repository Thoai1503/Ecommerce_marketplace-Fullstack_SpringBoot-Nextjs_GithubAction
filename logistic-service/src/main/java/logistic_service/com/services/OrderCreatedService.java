package logistic_service.com.services;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import logistic_service.com.dto.OrderItemDTO;
import logistic_service.com.dto.OrderDTO;
import logistic_service.com.entities.Shipment;
import logistic_service.com.entities.ShipmentItem;
import logistic_service.com.publisher.OrderStatusPublisher;
import logistic_service.com.repositories.ShipmentItemRepository;
import logistic_service.com.repositories.ShipmentRepository;


@Service
public class OrderCreatedService {
      
	private final ShipmentRepository shipmentRepository;
	private final ShipmentItemRepository itemRepository;
	private final OrderStatusPublisher orderStatusPublisher;
	//private final ShipmentStatusHistory shipmentStatusHistory;
	 private static final Logger LOGGER = LoggerFactory.getLogger(OrderCreatedService.class);
	public OrderCreatedService( ShipmentRepository shipmentRepository, ShipmentItemRepository itemRepository, OrderStatusPublisher orderStatusPublisher) {
		this.shipmentRepository =shipmentRepository;
		this.itemRepository =itemRepository;
		this.orderStatusPublisher = orderStatusPublisher;
	//	this.shipmentStatusHistory =shipmentStatusHistory;
	}
	
	
	public void createShipment(OrderDTO orderDTO) {
		LOGGER.info("Recipient Id: "+orderDTO.getRecipient().getId());
		var packageByShop = groupByShipment(orderDTO.getOrders_items());
		
		System.out.print("Size :"+ packageByShop.size());
	
		packageByShop.entrySet().forEach(entry->{
			var shipment=	shipmentRepository.save(buildShipmet(orderDTO,entry.getKey()));
			Long shopId = entry.getKey();
			System.out.println("Shipment ID: " + shopId);

	        entry.getValue().forEach(item -> {
	                   System.out.print("Item: "+item.toString());
	                   item.setShipmentId(shipment.getId());
	                   itemRepository.save(item);
	                   
	                   
	                   orderStatusPublisher.publish(new OrderPackageEvent(shipment.getId(), "PENDING"));    
	    	});
		});
	
	
	}
	public record OrderPackageEvent(Long id, String status) {}
	private Shipment buildShipmet(OrderDTO dto,Long shipmentId) {
		LOGGER.info("Presaved Recipient id:" + dto.getRecipient().getId());
		return Shipment.builder()
				       .trackingCode("LOG"+ UUID.randomUUID().toString().toUpperCase().substring(0, 8))
				       .orderShipmentRefId(shipmentId)
				       .recipientId(dto.getRecipient().getId())
				       .shopRefId(dto.getOrders_items().stream().filter(i-> i.getShipment_id()==shipmentId).toList().get(0).getShop_id())
				       .partnerId(Long.parseLong("1"))
				       .shippingFee(dto.getShipping_fee())
				       .codAmount(dto.getTotal_price()+dto.getShipping_fee())
				       .build();
	}
	
    
    private Map<Long,List<ShipmentItem>> groupByShipment(List<OrderItemDTO> itemDTOs){
    	var list = itemDTOs.stream().map(item->{
    		return buildShipmItem(item, item.getShipment_id());
    	});
    	return list.collect(Collectors.groupingBy(ShipmentItem::getShipmentId));
    }

    private ShipmentItem buildShipmItem(OrderItemDTO dto ,Long shipmentId) {
    	return ShipmentItem.builder()
    			           .shipmentId(shipmentId)
    			           .productName(dto.getProduct_name())
    			           .quantity(dto.getQuantity())
    			           .price(dto.getPrice())
    			           .build();
    }
    
	
}
