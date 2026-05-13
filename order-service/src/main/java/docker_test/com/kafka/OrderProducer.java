package docker_test.com.kafka;
import java.util.UUID;

import org.apache.kafka.clients.admin.NewTopic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

//import base_domain.com.dto.OrderEvent;
import docker_test.com.dto.OrderCreatedEvent;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrdersRepository;
import docker_test.com.service.OrderService;

@Service
public class OrderProducer {
	private static final Logger LOGGER = LoggerFactory.getLogger(OrderProducer.class);
	private static final double PLATFORM_COMMISSION_RATE = 0.10;
	
    private NewTopic newTopic;
    
    private final OrdersRepository orderRepository;
    
    private final OrderItemRepository orderItemRepository;
    
    private final OrderService  orderService;
    
	private KafkaTemplate<Object, Object> kafkaTemplate;


	 public OrderProducer(NewTopic newTopic, KafkaTemplate<Object, Object> kafkaTemplate,OrdersRepository orderRepository,OrderItemRepository orderItemRepository,OrderService orderService) {

		super();
		this.newTopic = newTopic;
		this.kafkaTemplate = kafkaTemplate;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.orderService =orderService;
	 }
	 
	 public void sendMessage(OrderCreatedEvent event) {
//		 var recipient = event.getRecipient();
//		 LOGGER.info(String.format("Recipient data => %s", recipient.toString()));
//		 LOGGER.info(String.format("Order event => %s", event.toString()));
//		 LOGGER.info(String.format("Order data => %s", event.getOrder().toString()));
		 var order = new Order();
		 	
		 order.setAddressId(event.getOrder().getAddress_id());
		 order.setDiscountAmount(event.getOrder().getDiscount_amount());
		 order.setOrderNumber(event.getOrder().getOrder_number()+UUID.randomUUID().toString().toUpperCase().substring(0, 8));
		 order.setFinalAmount(event.getOrder().getFinal_amount());
		 order.setTotalAmount(event.getOrder().getTotal_price());
		 order.setOrderStatus("PENDING");
		 order.setPaymentMethod(event.getOrder().getPayment_method());
		 order.setPaymentStatus("PENDING");
		 order.setOrderStatus(event.getStatus());
		 order.setPaymentMethod(event.getOrder().getPayment_method());
		 order.setShippingFee(event.getOrder().getShipping_fee());
		 order.setUserId(event.getOrder().getUser_id());
		
		  
		 var savedOrder = orderRepository.save(order);
		 System.out.println("Order saved to database with ID: " + savedOrder.getId());
		 
		 event.getOrder().setId(savedOrder.getId());
		 event.getOrder().setOrder_number(savedOrder.getOrderNumber());
		 event.setStatus("PENDING");
//		 
//		 Message<OrderCreatedEvent> message	= MessageBuilder
//				 .withPayload(event)
//				 .setHeader(KafkaHeaders.TOPIC, newTopic.name())
//				 .build();
//		 kafkaTemplate.send(message);	
		 var orderItems = event.getOrder().getOrders_items();
		 
		 orderItems.forEach(item -> {
			 var orderItem = new OrderItem();
			 orderItem.setOrderId(savedOrder.getId());
			 orderItem.setPrice(item.getPrice());
			 orderItem.setProductName(item.getProduct_name());
			 orderItem.setVariantName(item.getVariant_name());
			 orderItem.setTotalPrice(item.getPrice() * item.getQuantity());
			 orderItem.setProductId(item.getProduct_id());
			 orderItem.setShopId(item.getShop_id());
			 orderItem.setShipmentId(item.getShipment_id());
			 orderItem.setVariantId(item.getVariant_id());
			 orderItem.setQuantity(item.getQuantity());
			 orderItem.setImage(item.getImage_url());
			 double originalTotal = getItemOriginalTotal(item);
			 double shopVoucherDiscount = normalizeMoney(item.getShop_voucher_discount_amount());
			 double platformVoucherDiscount = normalizeMoney(item.getPlatform_voucher_discount_amount());
			 double totalVoucherDiscount = normalizeMoney(item.getTotal_voucher_discount_amount());
			 double totalAfterShopVoucher = getTotalAfterShopVoucher(item, originalTotal, shopVoucherDiscount);
			 double totalAfterAllVouchers = getTotalAfterAllVouchers(
					 item,
					 originalTotal,
					 shopVoucherDiscount,
					 platformVoucherDiscount,
					 totalVoucherDiscount);
			 double platformCommissionAmount = roundMoney(totalAfterShopVoucher * PLATFORM_COMMISSION_RATE);

			 orderItem.setShopVoucherDiscountAmount(Math.min(originalTotal, shopVoucherDiscount));
			 orderItem.setPlatformVoucherDiscountAmount(Math.min(originalTotal - shopVoucherDiscount, platformVoucherDiscount));
			 orderItem.setTotalVoucherDiscountAmount(Math.min(originalTotal, totalVoucherDiscount));
			 orderItem.setTotalAfterShopVoucher(totalAfterShopVoucher);
			 orderItem.setTotalAfterAllVouchers(totalAfterAllVouchers);
			 orderItem.setPlatformCommissionRate(PLATFORM_COMMISSION_RATE);
			 orderItem.setPlatformCommissionAmount(platformCommissionAmount);
			 orderItem.setSellerReceivableAmount(roundMoney(Math.max(0.0, totalAfterShopVoucher - platformCommissionAmount)));
			 orderItem.setIsAdjusted(false);
			 var savedOrderItem=  orderItemRepository.save(orderItem);
			 System.out.println("Order item saved to database with ID: " + savedOrderItem.toString());
			 item.setId(savedOrderItem.getId());
		 });
		 
		 

		 kafkaTemplate.send("order_created", event)
		    .whenComplete((result, ex) -> {
		        if (ex == null) {
		        	//result.toString()
		            System.out.println("✅ Sent OK: " + result.toString());
		        } else {
		            System.err.println("❌ SEND FAILED");
		            ex.printStackTrace();
		        }
		 });
	 }

	private double getItemOriginalTotal(docker_test.com.dto.OrderItemDTO item) {
		return item.getPrice() * Math.max(0, item.getQuantity());
	}

	private double normalizeMoney(Double value) {
		if (value == null || value.isNaN() || value.isInfinite() || value < 0) {
			return 0.0;
		}
		return value;
	}

	private double getTotalAfterShopVoucher(
			docker_test.com.dto.OrderItemDTO item,
			double originalTotal,
			double shopVoucherDiscount) {
		Double explicitTotal = item.getTotal_after_shop_voucher();
		if (explicitTotal != null) {
			return Math.max(0.0, Math.min(originalTotal, explicitTotal));
		}
		return Math.max(0.0, originalTotal - shopVoucherDiscount);
	}

	private double getTotalAfterAllVouchers(
			docker_test.com.dto.OrderItemDTO item,
			double originalTotal,
			double shopVoucherDiscount,
			double platformVoucherDiscount,
			double totalVoucherDiscount) {
		Double explicitTotal = item.getTotal_after_all_vouchers();
		if (explicitTotal != null) {
			return Math.max(0.0, Math.min(originalTotal, explicitTotal));
		}
		double computedDiscount = totalVoucherDiscount > 0
				? totalVoucherDiscount
				: shopVoucherDiscount + platformVoucherDiscount;
		return Math.max(0.0, originalTotal - computedDiscount);
	}

	private double roundMoney(double value) {
		return Math.round(Math.max(0.0, value) * 100.0) / 100.0;
	}
}	



