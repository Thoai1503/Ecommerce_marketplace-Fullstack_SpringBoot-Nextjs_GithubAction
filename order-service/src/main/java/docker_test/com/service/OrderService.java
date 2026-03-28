package docker_test.com.service;


import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderItemDTO;
import docker_test.com.dto.OrderShipmentDTO;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.model.OrderShipment;
import docker_test.com.publisher.OrderEventPublisher;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderRepository;
import docker_test.com.repository.OrderShipmentRepository;
import jakarta.transaction.Transactional;


@Service
public class OrderService {
	
//	
//	private final OrderRepository orderRepository;
//	
//      public OrderService(OrderRepository orderRepository) {
//		super();
//		this.orderRepository = orderRepository;
//	}
//
//	  private OrderDTO createOrder(OrderDTO orderDTO) {
//           
//		  Order order = new Order();
//		  
//		  order.setOrderNumber(orderDTO.getOrder_number());
//		  order.setTotalAmount(orderDTO.getTotal_price());;
//		  order.setDiscountAmount(orderDTO.getAddress_id());
//		  order.setOrderNumber(orderDTO.getOrder_number());
//		  order.setPaymentMethod(orderDTO.getPayment_method());
//		  order.setOrderStatus(orderDTO.getOrder_status());
//		  order.setShippingFee(orderDTO.getShipping_fee());
//		  
//		  
//	orderDTO.setId(	orderRepository.save(order).getId());
//		  
//	
//	return orderDTO;
//		  
//    	  
//    	  
//    	  
//      }  
	
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderEventPublisher eventPublisher;
    private final OrderShipmentRepository orderShipmentRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderEventPublisher eventPublisher,
                        OrderShipmentRepository orderShipmentRepository            
    		) {
        this.orderRepository   = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.eventPublisher     = eventPublisher;
        this.orderShipmentRepository = orderShipmentRepository;
    }

    // All DB writes + event publish happen in one transaction.
    // If any save fails, the whole operation rolls back.
    @Transactional
    public Order placeOrder(OrderDTO dto) {
        log.info("Placing order for user_id={}", dto.getUser_id());
        var itemsByShopIdMap = groupByShopId(dto.getOrders_items());
        
        Order order = buildOrder(dto);
        Order saved = orderRepository.save(order);
        log.info("Order persisted id={} number={}", saved.getId(), saved.getOrderNumber());

     
        itemsByShopIdMap.entrySet().forEach(entry -> {
        	Long shopId = entry.getKey();
        	System.out.println("Shop ID: " + shopId);
        	
        	var orderShipmetDto= new OrderShipment();
        	orderShipmetDto.setOrderId(saved.getId());
        	orderShipmetDto.setCarrierName("LOG");
        	orderShipmetDto.setShippingStatus("PENDING");
        	orderShipmetDto.setShopId(shopId);
        	orderShipmetDto.setTrackingNumber(null);
        	
        	var orderShipment = orderShipmentRepository.save(orderShipmetDto);
            log.info("Saved order shipmment -> {}", orderShipment.toString());
        	
            entry.getValue().forEach(item -> {
            	item.setShipmentId(orderShipment.getId());
            	item.setOrderId(saved.getId());
        		System.out.println("  Product ID: " + item.getProductId() +  ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice() + ", Product Name: " + item.getProductName() + ", Variant Name: " + item.getVariantName());
        		orderItemRepository.save(item);
        	});
        });
        
        


        dto.setId(saved.getId());
        dto.setRecipient(dto.getRecipient());
        dto.setOrder_number(saved.getOrderNumber());
        eventPublisher.publish(dto);

        return saved;
    }

    private Order buildOrder(OrderDTO dto) {
        return Order.builder()
                .userId(dto.getUser_id())
                .addressId(dto.getAddress_id())
                .orderNumber(dto.getOrder_number() + UUID.randomUUID().toString().toUpperCase().substring(0, 8))
                .totalAmount(dto.getTotal_price())
                .shippingFee(dto.getShipping_fee())
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
                .productName(dto.getProduct_name())
                .variantName(dto.getVariant_name())
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
