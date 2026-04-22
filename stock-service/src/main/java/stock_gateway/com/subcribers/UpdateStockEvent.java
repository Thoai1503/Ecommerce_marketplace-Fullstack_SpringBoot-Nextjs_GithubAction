package stock_gateway.com.subcribers;

import java.util.List;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import docker_test.com.dto.OrderItem;
import stock_gateway.com.models.ProductVariant;

@Component
public class UpdateStockEvent {
    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(UpdateStockEvent.class);

    
    @KafkaListener(topics = "${spring.kafka.topic.name}",groupId = "${spring.kafka.consumer.group-id}",
    		properties = {
				"spring.json.use.type.headers=false",
				"spring.json.value.default.type=docker_test.com.dto.OrderItem"
			})
	 public void consume(List<OrderItem> event) {
		
		for(OrderItem item : event) {
			ProductVariant variant = buildItem(item);
			LOGGER.info(String.format("Product variant to update stock => %s", variant.toString())); 
		}
	 }
    
    
    private ProductVariant buildItem(OrderItem item) {
		ProductVariant variant = new ProductVariant();
		variant.setId(item.getVariant_id());
		variant.setStockQuantity(variant.getStockQuantity());
		return variant;
	}
}
