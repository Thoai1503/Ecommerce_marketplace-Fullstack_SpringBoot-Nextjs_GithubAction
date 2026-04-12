package docker_test.com.service;


import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderItemDTO;
import docker_test.com.dto.OrderShipmentDTO;
import docker_test.com.exception.SimulatedRollbackException;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.model.OrderShipment;
import docker_test.com.publisher.OrderEventPublisher;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderRepository;
import docker_test.com.repository.OrderShipmentRepository;


@Service
public class OrderService {
	private final RedisTemplate redisTemplate;

    private static final String ROLLBACK_TEST_FLAG = "SIMULATE_ROLLBACK";
    private final int STOCK = 10;
	

	
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderEventPublisher eventPublisher;
    private final OrderShipmentRepository orderShipmentRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderEventPublisher eventPublisher,
                        OrderShipmentRepository orderShipmentRepository     ,
                        RedisTemplate redisTemplate
    		) {
        this.orderRepository   = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.eventPublisher     = eventPublisher;
        this.orderShipmentRepository = orderShipmentRepository;
        
        this.redisTemplate = redisTemplate;
    }

    // All DB writes + event publish happen in one transaction.
    // If any save fails, the whole operation rolls back.
    @Transactional
    public Order placeOrder(OrderDTO dto) {
        log.info("Placing order for user_id={}", dto.getUser_id());
        var itemsByShopIdMap = groupByShopId(dto.getOrders_items());
        
        Order order = buildOrder(dto);
        Order saved = orderRepository.save(order);
        maybeThrowSimulatedRollback(dto, saved.getId());
        List<OrderShipmentDTO> orderShipments = dto.getOrder_shipment();
        orderShipments.forEach(os -> {

        	var orderShipmetDto= new OrderShipment();
			orderShipmetDto.setOrderId(saved.getId());
			orderShipmetDto.setCarrierName("LOG");
			orderShipmetDto.setShippingStatus("PENDING");
			orderShipmetDto.setShopId(os.getShop_id());
			orderShipmetDto.setTrackingNumber(null);
			orderShipmetDto.setShippingFee(Double.valueOf(os.getShipping_fee()));
		    orderShipmetDto.setTotalAmount(os.getTotal_amount());
						var orderShipment =
			orderShipmentRepository.save(orderShipmetDto);
		    dto.getOrders_items().stream().filter(item->item.getShop_id()==os.getShop_id()).forEach(item->{
		    	System.out.println("Shipment id = {}"+ orderShipment.getId());
		    		     		item.setShipment_id(orderShipment.getId());
		    		     		
		    	orderItemRepository.save(buildItem(item, saved.getId()));
		    });
						
        	System.out.println("Order shipment = {}"+ os.toString());
		});
        
        log.info("Order persisted id={} number={}", saved.getId(), saved.getOrderNumber());


        
        dto.getOrders_items().stream().forEach(item ->{
        	item.setOrder_id(saved.getId());
        });
        dto.setId(saved.getId());
        dto.setRecipient(dto.getRecipient());
        dto.setOrder_number(saved.getOrderNumber());
        
        // Publish event with error handling and automatic rollback on failure
        try {
            eventPublisher.publish(dto);
            log.info("Order event published successfully for orderId={}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to publish order event for orderId={}. Transaction will be rolled back. Error: {}", 
                    saved.getId(), e.getMessage(), e);
            // Throwing exception will trigger @Transactional rollback
            throw new RuntimeException("Failed to publish order event: " + e.getMessage(), e);
        }

        return saved;
    }

        
        public ResponseEntity<?> processOrder(String productKey, int slMua) {
            long startTime = System.currentTimeMillis();
            String keyName = "sold:" + productKey; // ví dụ: sold:iPhone

            try {
                // Khởi tạo key nếu chưa tồn tại
                Boolean exists = redisTemplate.hasKey(keyName);
                if (Boolean.FALSE.equals(exists)) {
                    redisTemplate.opsForValue().setIfAbsent(keyName, "0");
                }

                // === PHẦN QUAN TRỌNG: INCR TRƯỚC - CHECK - ROLLBACK ===
                Long slBanRa = redisTemplate.opsForValue().increment(keyName, slMua);

                System.out.println("Trước khi user thành công thì số lượng bán ra: " + (slBanRa - slMua));
                System.out.println("Sau khi incrby thì số lượng bán ra: " + slBanRa);

                if (slBanRa > STOCK) {
                    // Rollback
                    redisTemplate.opsForValue().decrement(keyName, slMua);
                    System.out.println("Hết hàng tại thời điểm " + System.currentTimeMillis() + " - Đã rollback");

                    return ResponseEntity.ok(Map.of(
                        "msg", "Hết hàng",
                        "time", startTime,
                        "currentStockSold", slBanRa - slMua
                    ));
                }

                // === Thành công ===
                long endTime = System.currentTimeMillis();

                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "msg", "Đặt hàng thành công",
                    "time", startTime,
                    "sold", slBanRa,
                    "remaining", STOCK - slBanRa,
                    "processingTimeMs", endTime - startTime
                ));

            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of(
                    "msg", "Lỗi server",
                    "error", e.getMessage()
                ));
            }
        }
        
        
        
        
        // This method is for testing transaction rollback. If the cancel_reason is set to "SIMULATE_ROLLBACK", it throws a runtime exception after saving the order, which should trigger a rollback of the entire transaction.
    private void maybeThrowSimulatedRollback(OrderDTO dto, Long orderId) {
        if (ROLLBACK_TEST_FLAG.equalsIgnoreCase(dto.getCancel_reason())) {
            throw new SimulatedRollbackException(
                    "Rollback test triggered for orderId=" + orderId + ". Remove cancel_reason=SIMULATE_ROLLBACK to process normally.");
        }
    }

    private Order buildOrder(OrderDTO dto) {
        return Order.builder()
                .userId(dto.getUser_id())
                .addressId(dto.getAddress_id())
                .orderNumber(dto.getOrder_number() + UUID.randomUUID().toString().toUpperCase().substring(0, 8))
                .totalAmount(dto.getTotal_price())
                .shippingFee(Long.valueOf(dto.getShipping_fee().toString()))
                .discountAmount(dto.getDiscount_amount())
                .finalAmount(dto.getFinal_amount())
                .paymentMethod(dto.getPayment_method())
                .paymentStatus("PENDING")
                .orderStatus("PENDING")
                .build();
    }
    private OrderShipment buildOrderShipment (OrderShipmentDTO dto) {
    	return OrderShipment.builder()
    			.shopId(dto.getShop_id())
    			.orderId(dto.getOrder_id())
    		    .trackingNumber(dto.getTracking_number())
    		    .shippingStatus(dto.getShipping_status())
    		    .carrierName("LOG")
    		   
    			.build();
    }

    private List<OrderItem> buildItems(OrderDTO dto, Long orderId) {
        return dto.getOrders_items().stream()
                .map(i -> OrderItem.builder()
                        .orderId(orderId)
                        .productId(i.getProduct_id())
                        .variantId(i.getVariant_id())
                        .productName(i.getProduct_name())
                        .variantName(i.getVariant_name())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .totalPrice(i.getPrice() * i.getQuantity())
                        .build())
                .toList();
    }
    
    private OrderItem buildItem (OrderItemDTO dto, Long orderId) {
    	return OrderItem.builder()
                .orderId(orderId)
                .productId(dto.getProduct_id())
                .shopId(dto.getShop_id())
                .variantId(dto.getVariant_id())
                .shipmentId(dto.getShipment_id())
                .productName(dto.getProduct_name())
                .variantName(dto.getVariant_name())
                .image(dto.getImage_url())
                .quantity(dto.getQuantity())
                .price(dto.getPrice())
                .totalPrice(dto.getPrice() * dto.getQuantity())
                .build();
    }
    
    
    private Map<Long,List<OrderItem>> groupByShopId(List<OrderItemDTO> itemDTOs){
    	var list = itemDTOs.stream().map(item->{
    		return buildItem(item, null);
    	});
    	return list.collect(Collectors.groupingBy(OrderItem::getShopId));
    }
    
    
    private Map<Long, List<OrderItemDTO>> groupByShopId1 (OrderDTO order){
    	var list = order.getOrders_items();
    	 
    	list.stream().collect(Collectors.groupingBy(OrderItemDTO::getShop_id)).entrySet().forEach(entry -> {
        Long shopId = entry.getKey();
        System.out.println("Shop ID: " + shopId);
        entry.getValue().forEach(item -> {
            System.out.println("  Product ID: " + item.getProduct_id() + ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice() + ", Product Name: " + item.getProduct_name() + ", Variant Name: " + item.getVariant_name());
        });
 });

    	
    	return  list.stream().collect(Collectors.groupingBy(OrderItemDTO::getShop_id));
    }
    
	
}
