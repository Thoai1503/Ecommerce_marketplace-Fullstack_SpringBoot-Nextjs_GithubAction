package docker_test.com.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import docker_test.com.dto.OrderDTO;
import docker_test.com.dto.OrderItem;
import docker_test.com.dto.OrderPageResponse;
import docker_test.com.dto.OrderResponeDTO;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.dto.OrderShipmentDTO;
import docker_test.com.dto.AdminOrderListItemDTO;
import docker_test.com.model.Order;
import docker_test.com.models.OrderShipment;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrdersRepository;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.service.AdminOrderService;
import docker_test.com.service.OrderService;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController	
@RequestMapping("/api/orders")
public class OrderController {
   
//	private  OrderProducer orderProducer;
// 	
// 	public OrderController (OrderProducer orderProducer) {
// 		this.orderProducer =orderProducer;
// 	}

    private final OrderService orderService;
	private final OrdersRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final OrderShipmentRepository orderShipmentRepository;
	
	    private final AdminOrderService adminOrderService;
		private final ObjectMapper objectMapper;

	public OrderController(OrderService orderService,
						   OrdersRepository orderRepository,
						   OrderItemRepository orderItemRepository,
						   OrderShipmentRepository orderShipmentRepository,
						   AdminOrderService adminOrderService,
						   ObjectMapper objectMapper) {
        this.orderService = orderService;
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.orderShipmentRepository = orderShipmentRepository;
		this.adminOrderService = adminOrderService;
		this.objectMapper = objectMapper;
    }

	@PostMapping("")
	public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body) {
		try {
			OrderDTO dto = mapOrderPayload(body);
			OrderResponeDTO response = orderService.placeOrder(dto);
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Place order failed", "error", e.getMessage()));
		}
	}

	@SuppressWarnings("unchecked")
	private OrderDTO mapOrderPayload(Map<String, Object> body) {
		OrderDTO dto = new OrderDTO();
		dto.setId(asLong(body.get("id")));
		dto.setUser_id(asLong(body.get("user_id")));
		dto.setAddress_id(asLong(body.get("address_id")));
		dto.setOrder_number(asString(body.get("order_number")));
		dto.setShipping_fee(asLong(body.get("shipping_fee")));
		dto.setDiscount_amount(asLong(body.get("discount_amount")));
		dto.setPayment_method(asString(body.get("payment_method")));
		dto.setFinal_amount(asLong(body.get("final_amount")));
		dto.setOrder_status(asString(body.get("order_status")));
		dto.setTracking_number(asString(body.get("tracking_number")));
		dto.setCancel_reason(asString(body.get("cancel_reason")));
		dto.setVoucher_id(asLong(body.get("voucher_id")));
		dto.setPhone(asString(body.get("phone")));
		dto.setTotal_price(asDouble(body.get("total_price")));

		Object recipientRaw = body.get("recipient");
		if (recipientRaw instanceof Map<?, ?> recipientMap) {
			RecipientDTO recipient = new RecipientDTO();
			recipient.setName(asString(recipientMap.get("name")));
			recipient.setPhone(asString(recipientMap.get("phone")));
			recipient.setAddress(asString(recipientMap.get("address")));
			recipient.setProvince(asInteger(recipientMap.get("province")));
			recipient.setDistrict(asInteger(recipientMap.get("district")));
			recipient.setWard(asInteger(recipientMap.get("ward")));
			dto.setRecipient(recipient);
		}

		List<OrderItem> items = new ArrayList<>();
		Object itemsRaw = body.get("orders_items");
		if (itemsRaw instanceof List<?> itemsList) {
			for (Object itemRaw : itemsList) {
				if (itemRaw instanceof Map<?, ?> itemMap) {
					OrderItem item = new OrderItem();
					item.setId(asLong(itemMap.get("id")));
					item.setOrder_id(asLong(itemMap.get("order_id")));
					item.setShipment_id(asLong(itemMap.get("shipment_id")));
					item.setShop_id(asLong(itemMap.get("shop_id")));
					item.setProduct_id(asLong(itemMap.get("product_id")));
					item.setVariant_id(asLong(itemMap.get("variant_id")));
					item.setProduct_name(asString(itemMap.get("product_name")));
					item.setVariant_name(asString(itemMap.get("variant_name")));
					item.setQuantity(asInteger(itemMap.get("quantity")));
					item.setPrice(asDouble(itemMap.get("price")));
					item.setImage_url(asString(itemMap.get("image_url")));
					items.add(item);
				}
			}
		}
		dto.setOrders_items(items);

		List<OrderShipmentDTO> shipments = new ArrayList<>();
		Object shipmentsRaw = body.get("order_shipment");
		if (shipmentsRaw instanceof List<?> shipmentList) {
			for (Object shipmentRaw : shipmentList) {
				if (shipmentRaw instanceof Map<?, ?> shipmentMap) {
					OrderShipmentDTO shipment = new OrderShipmentDTO();
					shipment.setOrder_id(asLong(shipmentMap.get("order_id")));
					shipment.setShop_id(asLong(shipmentMap.get("shop_id")));
					shipment.setCarrier_name(asString(shipmentMap.get("carrier_name")));
					shipment.setShipping_fee(asDouble(shipmentMap.get("shipping_fee")));
					shipment.setTotal_amount(asDouble(shipmentMap.get("total_amount")));
					shipment.setTracking_number(asString(shipmentMap.get("tracking_number")));
					shipment.setShipping_status(asString(shipmentMap.get("shipping_status")));
					shipments.add(shipment);
				}
			}
		}
		dto.setOrder_shipment(shipments);

		return dto;
	}

	private String asString(Object value) {
		return value == null ? null : String.valueOf(value);
	}

	private Long asLong(Object value) {
		if (value == null || String.valueOf(value).isBlank()) {
			return null;
		}
		return ((Number) objectMapper.convertValue(value, Number.class)).longValue();
	}

	private Integer asInteger(Object value) {
		if (value == null || String.valueOf(value).isBlank()) {
			return null;
		}
		return ((Number) objectMapper.convertValue(value, Number.class)).intValue();
	}

	private double asDouble(Object value) {
		if (value == null || String.valueOf(value).isBlank()) {
			return 0D;
		}
		return ((Number) objectMapper.convertValue(value, Number.class)).doubleValue();
	}
	
	  @PostMapping("/create")
	    public ResponseEntity<?> create(@RequestBody Order item) {
	        try {
	            return ResponseEntity.ok(orderRepository.save(item));
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(java.util.Map.of("message", "Create order failed", "error", e.getMessage()));
	        }
	    }

	    @GetMapping("")
	    public OrderPageResponse<AdminOrderListItemDTO> getOrders(
	            @RequestParam(required = false) Long userId,
	            @RequestParam(required = false) String startDate,
	            @RequestParam(required = false) String endDate,
	            @RequestParam(required = false) Double minAmount,
	            @RequestParam(required = false) Double maxAmount,
	            @RequestParam(defaultValue = "all") String status,
	            @RequestParam(defaultValue = "date") String sortBy,
	            @RequestParam(defaultValue = "desc") String sortOrder,
	            @RequestParam(defaultValue = "1") int page,
	            @RequestParam(defaultValue = "10") int size
	    ) {

	        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
	        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

	        return adminOrderService.getAdminOrders(
	                userId,
	                start,
	                end,
	                minAmount,
	                maxAmount,
	                status,
	                sortBy,
	                sortOrder,
	                page,
	                size
	        );
	    }

//	    @GetMapping("/{id}")
//	    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
//	        Order order = adminOrderService.getAdminOrderById(id);
//	        if (order == null) {
//	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//	                    .body(java.util.Map.of("message", "Order not found", "id", id));
//	        }
//	        return ResponseEntity.ok(order);
//	    }

	@GetMapping("/{id}")
	public ResponseEntity<?> getOrderById(@PathVariable Long id) {
		Order order = orderRepository.findById(id).orElse(null);
		if (order == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "Order not found", "id", id));
		}

		List<OrderItem> items = orderItemRepository.findByOrderId(id);
		List<OrderShipment> shipments = orderShipmentRepository.findByOrderIdOrderByIdDesc(id);

		Map<String, Object> response = new LinkedHashMap<>();
		response.put("id", order.getId());
		response.put("orderId", order.getId());
		response.put("orderNumber", order.getOrderNumber());
		response.put("userId", order.getUserId());
		response.put("addressId", order.getAddressId());
		response.put("totalAmount", order.getTotalAmount());
		response.put("shippingFee", order.getShippingFee());
		response.put("discountAmount", order.getDiscountAmount());
		response.put("finalAmount", order.getFinalAmount());
		response.put("paymentMethod", order.getPaymentMethod());
		response.put("paymentStatus", order.getPaymentStatus());
		response.put("orderStatus", order.getOrderStatus());
		response.put("trackingNumber", order.getTrackingNumber());
		response.put("returnStatusSummary", order.getReturnStatusSummary());
		response.put("lastReturnRequestId", order.getLastReturnRequestId());
		response.put("items", items);
		response.put("shipments", shipments);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}/items")
	public ResponseEntity<?> getOrderItems(@PathVariable Long id) {
		if (!orderRepository.existsById(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "Order not found", "id", id));
		}
		return ResponseEntity.ok(orderItemRepository.findByOrderId(id));
	}
	
	
	
	   public record OrderResponseDTO(Long id, String orderNumber, String status) {}
}
