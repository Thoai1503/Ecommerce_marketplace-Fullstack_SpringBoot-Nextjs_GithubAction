package stock_gateway.com.subcribers;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import docker_test.com.dto.OrderItem;
import stock_gateway.com.repository.ProductVariantRepository;
import stock_gateway.com.service.StockService;

@Component
public class UpdateStockEvent {
    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(UpdateStockEvent.class);

	private final ProductVariantRepository productVariantRepository;
  private final StockService stockService;
	public UpdateStockEvent(ProductVariantRepository productVariantRepository, StockService stockService) {
		this.productVariantRepository = productVariantRepository;
		this.stockService = stockService;
	}


    @KafkaListener(topics = "${spring.kafka.topic.stock-update.name}",groupId = "${spring.kafka.consumer.group-id}",
    		properties = {
				"spring.json.use.type.headers=false",
				"spring.json.value.default.type=docker_test.com.dto.OrderItem"
			})
	 public void consume(OrderItem event) {
    	LOGGER.info(String.format("Stock update event received => %s", event.toString()));
		if (event.getVariant_id() == null || event.getQuantity() <= 0) {
			LOGGER.warn("Skip stock update because payload is invalid: {}", event);
			return;
		}

		productVariantRepository.findById(event.getVariant_id()).ifPresentOrElse(variant -> {
//			variant.setStockQuantity(Math.max(variant.getStockQuantity() - event.getQuantity(), 0));
//			productVariantRepository.save(variant);
			 stockService.reverseStockUpdate(event.getVariant_id(), event.getQuantity());
			LOGGER.info("Stock updated. variantId={}, quantity={}, newStock={}", event.getVariant_id(), event.getQuantity(), Math.max(variant.getStockQuantity() - event.getQuantity(), 0));
		}, () -> LOGGER.warn("Variant not found for stock update. variantId={}, payload={}", event.getVariant_id(), event));

	 }
    
    
//    private ProductVariant buildItem(OrderItem item) {
//		ProductVariant variant = new ProductVariant();
//		variant.setId(item.getVariant_id());
//		variant.setStockQuantity(variant.getStockQuantity());
//		return variant;
//	}
}
