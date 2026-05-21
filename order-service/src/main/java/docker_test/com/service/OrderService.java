package docker_test.com.service;


import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderItemDTO;
import docker_test.com.dto.OrderResponeDTO;
import docker_test.com.dto.OrderShipmentDTO;
import docker_test.com.dto.PaymentStatusUpdatedEvent;
import docker_test.com.exception.SimulatedRollbackException;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.model.ReturnStatusSummary;
import docker_test.com.model.OrderShipment;
import docker_test.com.publisher.OrderEventPublisher;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrdersRepository;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.dto.*;

@Service
public class OrderService {
    private final RedisTemplate<Object, Object> redisTemplate;

    private static final String ROLLBACK_TEST_FLAG = "SIMULATE_ROLLBACK";
    private static final double PLATFORM_COMMISSION_RATE = 0.10;
    private final int STOCK = 10;// Giả sử chỉ có 10 sản phẩm trong kho để bán
    private final WebClient webClient;
    private final String paymentServiceUrl;
	

	
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrdersRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderEventPublisher eventPublisher;
    private final OrderShipmentRepository orderShipmentRepository;

    public OrderService(OrdersRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderEventPublisher eventPublisher,
                        OrderShipmentRepository orderShipmentRepository     ,
                        @Qualifier("redisTemplate") RedisTemplate<Object, Object> redisTemplate,
						WebClient webClient,
						@Value("${payment.service.url}") String paymentServiceUrl
    		) {
        this.orderRepository   = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.eventPublisher     = eventPublisher;
        this.orderShipmentRepository = orderShipmentRepository;
        
        this.redisTemplate = redisTemplate;
        this.webClient = webClient;
                this.paymentServiceUrl = paymentServiceUrl;
    }

    // All DB writes + event publish happen in one transaction.
    // If any save fails, the whole operation rolls back.
    @Transactional
    public OrderResponeDTO placeOrder(OrderDTO dto) {
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
        	orderShipmetDto.setAdjustmentRequired(false);
        	orderShipmetDto.setBusinessStatus("NORMAL");
        	orderShipmetDto.setReturnStatusSummary("NONE");
			orderShipmetDto.setVoucherIds(os.getVoucher_id());
			orderShipmetDto.setShippingFee(Double.valueOf(os.getShipping_fee()));
		    orderShipmetDto.setTotalAmount(os.getTotal_amount());
		    orderShipmetDto.setSubtotal(os.getSubtotal());
		    orderShipmetDto.setTotalAfterVoucher(os.getTotal_after_voucher());
						var orderShipment =
			orderShipmentRepository.save(orderShipmetDto);
						
						
						
            List<OrderItem> itemsForShop = itemsByShopIdMap.get(os.getShop_id());
            calculateUnitShopDiscount(itemsForShop);
            calculateUnitPlatformDiscount(itemsForShop);
           
           
             orderItemRepository.saveAll(itemsForShop.stream().map(item -> {
				 item.setOrderId(saved.getId());
				 item.setShipmentId(orderShipment.getId());
				 dto.getOrders_items().stream().filter(i -> Objects.equals(i.getShop_id(), os.getShop_id()) 
						 && Objects.equals(i.getProduct_id(), item.getProductId())
						 && Objects.equals(i.getVariant_id(), item.getVariantId())
						 ).findFirst().ifPresent(matchingItem -> {
							 item.setImage(matchingItem.getImage_url());
							 item.setProductName(matchingItem.getProduct_name());
							 item.setVariantName(matchingItem.getVariant_name());
							 item.setShipmentId(orderShipment.getId());
						 });
				 return item;
			 }).toList());
//            
//		    dto.getOrders_items().stream().filter(item -> Objects.equals(item.getShop_id(), os.getShop_id())).forEach(item->{
//		   
//		    		     		
//		    	orderItemRepository.save(buildItem(item, saved.getId()));
//		    });
//						
             dto.getOrders_items().stream().filter(item -> Objects.equals(item.getShop_id(), os.getShop_id())).forEach(item->{
 		    	System.out.println("Shipment id = {}"+ orderShipment.getId());
 		    		     		item.setShipment_id(orderShipment.getId());
 		    		     		
 		    	
 		    });
        	System.out.println("Order shipment = {}"+ os.toString());
		});
        
        log.info("Order persisted id={} number={}", saved.getId(), saved.getOrderNumber());


        
    
        dto.setId(saved.getId());
        dto.setRecipient(dto.getRecipient());
        dto.setOrder_number(saved.getOrderNumber());
        dto.getOrders_items().forEach(item -> {
			item.setOrder_id(saved.getId());
			
		});
        
        
              
        
        String paymentCreateUrl = resolvePaymentCreateUrl();
        log.info("Calling payment service URL: {}", paymentCreateUrl);

        String paymentUrl = null;
        if(
        		//saved.getPaymentMethod().trim().toUpperCase()!="COD"
        		 !"COD".equalsIgnoreCase(saved.getPaymentMethod())
        		) {
        	log.info("Order {} has payment method {}. Proceeding to generate payment URL.", saved.getId(), saved.getPaymentMethod());
			log.info("Order {} requires online payment. Initiating payment URL generation.", saved.getId());
			 paymentUrl = webClient.post()
					.uri(paymentCreateUrl)
					.bodyValue(Map.of(
							"orderId", saved.getId(),
							"amount", saved.getFinalAmount(),
							"paymentProvider", saved.getPaymentMethod(),
							"orderInfo", "Payment for order " + saved.getOrderNumber(),
							"ipAddress", "10.0.0.0.1",
							"orderType", "ecommerce"))
					.retrieve()
					.bodyToMono(String.class)
					.block();
			System.out.println("Payment url response: " + paymentUrl);
		} else {
			log.info("Order {} is Cash on Delivery. Skipping payment URL generation.", saved.getId());
		}

        try {
            eventPublisher.publish(dto);
         dto.getOrders_items().forEach(item -> {
          	 eventPublisher.publishStockUpdate(item);
         });
            log.info("Order event published successfully for orderId={}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to publish order event for orderId={}. Transaction will be rolled back. Error: {}", 
                    saved.getId(), e.getMessage(), e);
            // Throwing exception will trigger @Transactional rollback
            throw new RuntimeException("Failed to publish order event: " + e.getMessage(), e);
        }
        OrderResponeDTO responseDTO = new OrderResponeDTO();
        responseDTO.setId(saved.getId().intValue());
        
        if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
		
            if (paymentUrl != null && !paymentUrl.isBlank()) {
                log.info("Payment URL generated for orderId={}", saved.getId());
                responseDTO.setPaymentUrl(paymentUrl);
                return responseDTO;
            } else {
            //	Arrays.sort(paymentUrl == null ? new String[]{} : new String[]{paymentUrl});
                log.warn("Payment URL generation failed for orderId={}. Response: {}", saved.getId(), paymentUrl);
                saved.setPaymentStatus("FAILED");
                orderRepository.save(saved);
                responseDTO.setPaymentUrl("http:103.90.225.130:4000/orders/" + saved.getId());
                // Depending on business rules, you might want to throw an exception here to rollback the order creation
                // throw new RuntimeException("Payment failed for orderId=" + saved.getId());
            }
        }

        return responseDTO;
    }

    private String resolvePaymentCreateUrl() {
   
        if (paymentServiceUrl.endsWith("/")) {
        	log.info("payment.service.url ends with '/'. Constructing payment URL accordingly.");
            return paymentServiceUrl + "api/payments/create-url";
        }
            log.info("Constructing payment URL using payment.service.url: {}", paymentServiceUrl);
        return paymentServiceUrl.trim() + "/api/payments/create-url";
    }

    @Transactional
    public void applyPaymentStatusEvent(PaymentStatusUpdatedEvent event) {
        if (event == null || event.getOrderId() == null) {
            throw new IllegalArgumentException("orderId is required");
        }

        boolean paymentSuccess = isPaymentSuccess(event);
        String normalizedPaymentStatus = paymentSuccess ? "PAID" : "FAILED";

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

        order.setPaymentStatus(normalizedPaymentStatus);
        if (!paymentSuccess) {
            order.setOrderStatus("CANCELED");
        }
        orderRepository.save(order);					

        log.info("Payment status updated for orderId={}, paymentStatus={}, txnRef={}, provider={}, responseCode={}",
                event.getOrderId(),
                normalizedPaymentStatus,
                event.getTxnRef(),
                event.getProvider(),
                event.getResponseCode());
    }							

    private boolean isPaymentSuccess(PaymentStatusUpdatedEvent event) {
        boolean isSuccess = Boolean.TRUE.equals(event.getSuccess());
        String responseCode = event.getResponseCode() == null ? "" : event.getResponseCode().trim().toUpperCase(Locale.ROOT);

        return isSuccess && "00".equals(responseCode);
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
                    // Rollb	ack
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
                .voucherId(normalizeVoucherId(dto.getVoucher_id()))
                .returnStatusSummary(ReturnStatusSummary.NONE)
                
                .build();
    }

    private Long normalizeVoucherId(Long voucherId) {
        return voucherId != null && voucherId > 0 ? voucherId : null;
    }
    private OrderShipment buildOrderShipment (OrderShipmentDTO dto) {
        OrderShipment shipment = new OrderShipment();
        shipment.setShopId(dto.getShop_id());
        shipment.setOrderId(dto.getOrder_id());
        shipment.setTrackingNumber(dto.getTracking_number());
        shipment.setShippingStatus(dto.getShipping_status());
        shipment.setCarrierName("LOG");
        shipment.setReturnStatusSummary("NONE"); // Ensure not null
        return shipment;
    }

    private List<OrderItem> buildItems(OrderDTO dto, Long orderId) {
        var list= dto.getOrders_items().stream()
                .map(i -> OrderItem.builder()
                        .orderId(orderId)
                        .productId(i.getProduct_id())
                        .variantId(i.getVariant_id())
                        .productName(i.getProduct_name())
                        .variantName(i.getVariant_name())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .totalPrice(i.getPrice() * i.getQuantity())
                        .shopVoucherDiscountAmount(getShopVoucherDiscountAmount(i))
                        .platformVoucherDiscountAmount(getPlatformVoucherDiscountAmount(i))
                        .totalVoucherDiscountAmount(getTotalVoucherDiscountAmount(i))
                        .totalAfterShopVoucher(getTotalAfterShopVoucher(i))
                        .totalAfterAllVouchers(getTotalAfterAllVouchers(i))
                        .platformCommissionRate(normalizeMoney(i.getPlatform_commission_rate()))
                        .platformCommissionAmount(normalizeMoney(i.getPlatform_commission_amount()))
                        .sellerReceivableAmount(normalizeMoney(i.getSeller_receivable_amount()))
                        .unitPlatformVoucherDiscount(getPlatformVoucherDiscountAmount(i) / Math.max(1, i.getQuantity()))
                        .unitShopVoucherDiscount(getShopVoucherDiscountAmount(i) / Math.max(1, i.getQuantity()))
                        .build())
                .toList();
        
        
        return list;
    }
    
    private OrderItem buildItem (docker_test.com.dto.OrderItem dto, Long orderId) {
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
                .totalPrice(getItemOriginalTotal(dto))
                .shopVoucherDiscountAmount(getShopVoucherDiscountAmount(dto))
                .platformVoucherDiscountAmount(getPlatformVoucherDiscountAmount(dto))
                .totalVoucherDiscountAmount(getTotalVoucherDiscountAmount(dto))
                .totalAfterShopVoucher(getTotalAfterShopVoucher(dto))
                .totalAfterAllVouchers(getTotalAfterAllVouchers(dto))
                .platformCommissionRate(PLATFORM_COMMISSION_RATE)
                .platformCommissionAmount(getPlatformCommissionAmount(dto))
                .sellerReceivableAmount(getSellerReceivableAmount(dto))
                .isAdjusted(false)
                .build();
    }

    private double getItemOriginalTotal(docker_test.com.dto.OrderItemDTO dto) {
        return dto.getPrice() * Math.max(0, dto.getQuantity());
    }

    private double normalizeMoney(Double value) {
        if (value == null || value.isNaN() || value.isInfinite() || value < 0) {
            return 0.0;
        }
        return value;
    }

    private double getShopVoucherDiscountAmount(docker_test.com.dto.OrderItemDTO dto) {
        return Math.min(getItemOriginalTotal(dto), normalizeMoney(dto.getShop_voucher_discount_amount()));
    }

    private double getPlatformVoucherDiscountAmount(docker_test.com.dto.OrderItemDTO dto) {
        double originalTotal = getItemOriginalTotal(dto);
        double shopDiscount = getShopVoucherDiscountAmount(dto);
        return Math.min(originalTotal - shopDiscount, normalizeMoney(dto.getPlatform_voucher_discount_amount()));
    }

    private double getTotalVoucherDiscountAmount(docker_test.com.dto.OrderItemDTO dto) {
        double explicitTotalDiscount = normalizeMoney(dto.getTotal_voucher_discount_amount());
        double computedTotalDiscount = getShopVoucherDiscountAmount(dto) + getPlatformVoucherDiscountAmount(dto);
        double totalDiscount = explicitTotalDiscount > 0 ? explicitTotalDiscount : computedTotalDiscount;
        return Math.min(getItemOriginalTotal(dto), totalDiscount);
    }

    private double getTotalAfterShopVoucher(docker_test.com.dto.OrderItemDTO dto) {
        Double explicitTotal = dto.getTotal_after_shop_voucher();
        if (explicitTotal != null) {
            return Math.max(0.0, Math.min(getItemOriginalTotal(dto), explicitTotal));
        }
        return Math.max(0.0, getItemOriginalTotal(dto) - getShopVoucherDiscountAmount(dto));
    }

    private double getTotalAfterAllVouchers(docker_test.com.dto.OrderItemDTO dto) {
        Double explicitTotal = dto.getTotal_after_all_vouchers();
        if (explicitTotal != null) {
            return Math.max(0.0, Math.min(getItemOriginalTotal(dto), explicitTotal));
        }
        return Math.max(0.0, getItemOriginalTotal(dto) - getTotalVoucherDiscountAmount(dto));
    }

    private double getCommissionBase(docker_test.com.dto.OrderItemDTO dto) {
        double totalAfterShopVoucher = getTotalAfterShopVoucher(dto);
        if (totalAfterShopVoucher > 0) {
            return totalAfterShopVoucher;
        }
        return Math.max(0.0, getItemOriginalTotal(dto) - getShopVoucherDiscountAmount(dto));
    }

    private double getPlatformCommissionAmount(docker_test.com.dto.OrderItemDTO dto) {
        return roundMoney(getCommissionBase(dto) * PLATFORM_COMMISSION_RATE);
    }

    private double getSellerReceivableAmount(docker_test.com.dto.OrderItemDTO dto) {
        double commissionBase = getCommissionBase(dto);
        double platformCommissionAmount = roundMoney(commissionBase * PLATFORM_COMMISSION_RATE);
        return roundMoney(Math.max(0.0, commissionBase - platformCommissionAmount));
    }

    private double roundMoney(double value) {
        return Math.round(Math.max(0.0, value) * 100.0) / 100.0;
    }
    
    
    private Map<Long,List<OrderItem>> groupByShopId(List<docker_test.com.dto.OrderItem> itemDTOs){
        var list = itemDTOs.stream().map(item->{
            return buildItem(item, null);
        });
        return list.collect(Collectors.groupingBy(OrderItem::getShopId));
    }
    
    
    private Map<Long, List<OrderItem>> groupByShopId1 (OrderDTO order){
        var list = order.getOrders_items();
         
        list.stream().collect(Collectors.groupingBy(docker_test.com.dto.OrderItem::getShop_id)).entrySet().forEach(entry -> {
        Long shopId = entry.getKey();
        System.out.println("Shop ID: " + shopId);
        entry.getValue().forEach(item -> {
            System.out.println("  Product ID: " + item.getProduct_id() + ", Quantity: " + item.getQuantity() + ", Price: " + item.getPrice() + ", Product Name: " + item.getProduct_name() + ", Variant Name: " + item.getVariant_name());
        });
 });

        
        return  list.stream().map(item -> buildItem(item, null)).collect(Collectors.groupingBy(OrderItem::getShopId));
    }
    
    
    public static List<OrderItem> allocatePlatformDiscount(
            List<OrderItem> items,
            double platformDiscount
    ) {

        double total = items.stream()
                .mapToDouble(OrderItem::getTotalAfterShopVoucher)
                .sum();

        if (total <= 0 || platformDiscount <= 0) {
            return items;
        }

        double allocatedSum = 0;

        for (OrderItem item : items) {

            double ratio = item.getTotalAfterShopVoucher() / total;

            double raw = platformDiscount * ratio;

            double allocated = floor2(raw);

            item.setPlatformVoucherDiscountAmount(
                    allocated
            );

            allocatedSum += allocated;
        }

        double remainder =
                round2(platformDiscount - allocatedSum);

        OrderItem lastItem =
                items.get(items.size() - 1);

        lastItem.setPlatformVoucherDiscountAmount(
                round2(
                        lastItem.getPlatformVoucherDiscountAmount()
                                + remainder
                )
        );

        calculateUnitPlatformDiscount(items);

        return items;
    }

    public static List<OrderItem> allocateShopDiscount(
            List<OrderItem> items,
            double shopDiscount
    ) {

        double total = items.stream()
                .mapToDouble(OrderItem::getTotalPrice)
                .sum();

        if (total <= 0 || shopDiscount <= 0) {
            return items;
        }

        double allocatedSum = 0;

        for (OrderItem item : items) {

            double ratio =
                    item.getTotalPrice() / total;

            double raw =
                    shopDiscount * ratio;

            double allocated =
                    floor2(raw);

            item.setShopVoucherDiscountAmount(
                    allocated
            );

            allocatedSum += allocated;
        }

        double remainder =
                round2(shopDiscount - allocatedSum);

        OrderItem lastItem =
                items.get(items.size() - 1);

        lastItem.setShopVoucherDiscountAmount(
                round2(
                        lastItem.getShopVoucherDiscountAmount()
                                + remainder
                )
        );

        calculateUnitShopDiscount(items);

        return items;
    }

    private static void calculateUnitShopDiscount(
            List<OrderItem> items
    ) {

        for (OrderItem item : items) {

            if (item.getQuantity() <= 0) {
                continue;
            }

            double unitDiscount =
                    round2(
                            item.getShopVoucherDiscountAmount()
                                    / item.getQuantity()
                    );

            item.setUnitShopVoucherDiscount(
                    unitDiscount
            );
        }
    }

    private static void calculateUnitPlatformDiscount(
            List<OrderItem> items
    ) {

        for (OrderItem item : items) {

            if (item.getQuantity() <= 0) {
                continue;
            }

            double unitDiscount =round2(item.getPlatformVoucherDiscountAmount()/ item.getQuantity());

            item.setUnitPlatformVoucherDiscount(
                    unitDiscount
            );
        }
    }

    public static double floor2(double value) {
        return Math.floor(value * 100) / 100;
    }

    public static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
	
}
