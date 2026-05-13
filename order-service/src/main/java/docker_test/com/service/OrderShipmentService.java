package docker_test.com.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import docker_test.com.dto.ConfirmPackagedResponseDTO;
import docker_test.com.dto.ConfirmReceivedResponseDTO;
import docker_test.com.dto.CancelShipmentByOosRequestDTO;
import docker_test.com.dto.CancelShipmentByOosResponseDTO;
import docker_test.com.dto.CancelShipmentRequestDTO;
import docker_test.com.dto.CreateAdjustmentRequestDTO;
import docker_test.com.dto.CreateAdjustmentResponseDTO;
import docker_test.com.dto.GetAdjustmentRequestDTO;
import docker_test.com.dto.OrderShipmentByShopResponseDTO;
import docker_test.com.dto.OrderShipmentResponeDTO;
import docker_test.com.dto.ShipmentStatusUpdatedEvent;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.model.OrderShipment;
import docker_test.com.model.OrderShipmentStatusHistory;
import docker_test.com.model.ShipmentAdjustmentItem;
import docker_test.com.model.ShipmentAdjustmentRequest;
import docker_test.com.repository.OrdersRepository;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.repository.OrderShipmentStatusHistoryRepository;
import docker_test.com.repository.OrderShipmentWithOrderAndRecipientProjection;
import docker_test.com.repository.ShipmentAdjustmentItemRepository;
import docker_test.com.repository.ShipmentAdjustmentRequestRepository;

@Service
public class OrderShipmentService {

    private static final double PLATFORM_COMMISSION_RATE = 0.10;

    private final OrderShipmentRepository orderShipmentRepository;
    private final OrderItemRepository orderItemRepository;
        private final OrderShipmentStatusHistoryRepository orderShipmentStatusHistoryRepository;
        private final OrdersRepository orderRepository;
        private final ShipmentAdjustmentRequestRepository shipmentAdjustmentRequestRepository;
        private final ShipmentAdjustmentItemRepository shipmentAdjustmentItemRepository;
        private final WebClient webClient;

        @Value("${logistics.service.url:http://localhost:8007}")
        private String logisticsServiceUrl;

    public OrderShipmentService(OrderShipmentRepository orderShipmentRepository,
                                                                OrderItemRepository orderItemRepository,
                                                                OrderShipmentStatusHistoryRepository orderShipmentStatusHistoryRepository,
                                                                OrdersRepository orderRepository,
                                                                ShipmentAdjustmentRequestRepository shipmentAdjustmentRequestRepository,
                                                                ShipmentAdjustmentItemRepository shipmentAdjustmentItemRepository,
                                                                WebClient webClient) {
        this.orderShipmentRepository = orderShipmentRepository;
        this.orderItemRepository = orderItemRepository;	
                this.orderShipmentStatusHistoryRepository = orderShipmentStatusHistoryRepository;
                this.orderRepository = orderRepository;
                this.shipmentAdjustmentRequestRepository = shipmentAdjustmentRequestRepository;
                this.shipmentAdjustmentItemRepository = shipmentAdjustmentItemRepository;
                this.webClient = webClient;
    }
    
    public OrderShipmentResponeDTO getShipmentById(Long shipmentId) {
        OrderShipmentWithOrderAndRecipientProjection row = orderShipmentRepository.findShipmentDetailsById(shipmentId)
				.orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

		// Fetch full shipment object to get businessStatus, adjustmentRequired, latestAdjustmentRequestId
		OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
				.orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

		List<OrderItem> items = orderItemRepository.findByShipmentId(shipmentId);
                List<OrderShipmentStatusHistory> histories = orderShipmentStatusHistoryRepository
                                .findByOrderShipmentIdOrderByChangedAtAscIdAsc(shipmentId);

                List<OrderShipmentResponeDTO.OrderItemInfoDTO> itemDTOs = items.stream()
                                .map(item -> new OrderShipmentResponeDTO.OrderItemInfoDTO(
						item.getId(),
						item.getProductId(),
						item.getVariantId(),
						item.getProductName(),
						item.getVariantName(),
						item.getImage(),
						item.getQuantity(),
						item.getPrice(),
						item.getTotalPrice(),
						item.getShopVoucherDiscountAmount(),
						item.getPlatformVoucherDiscountAmount(),
						item.getTotalVoucherDiscountAmount(),
						item.getTotalAfterShopVoucher(),
						item.getTotalAfterAllVouchers(),
						item.getPlatformCommissionRate(),
						item.getPlatformCommissionAmount(),
						item.getSellerReceivableAmount()
				))
				.toList();

                List<OrderShipmentResponeDTO.ShipmentStatusLogDTO> historyDTOs = histories.stream()
                                .map(history -> new OrderShipmentResponeDTO.ShipmentStatusLogDTO(
                                                history.getId(),
                                                history.getNewStatus(),
                                                history.getNote(),
                                                history.getChangedAt(),
                                                history.getChangedBy()))
                                .toList();

		return new OrderShipmentResponeDTO(
                row.getShipmentId(),
                row.getOrderId(),
                row.getShopId(),
                row.getShopName(),
                row.getShippingFee(),
                Long.valueOf(row.getTotalAmount().longValue()),
                row.getCarrierName(),
                row.getTrackingNumber(), 
                row.getShippingStatus(),
                shipment.getBusinessStatus(),
                shipment.getAdjustmentRequired(),
                shipment.getLatestAdjustmentRequestId(),
                shipment.getReturnStatusSummary(),
                new OrderShipmentResponeDTO.OrderInfoDTO(
                        row.getOrderNumber(),
                        row.getUserId(),
                        row.getAddressId(),
                        row.getTotalAmount(),
                        row.getShippingFee(),
                        row.getDiscountAmount(),
                        row.getFinalAmount(),
                        row.getPaymentMethod(),
                        row.getPaymentStatus(),
                        row.getOrderStatus()
                ),
                new OrderShipmentResponeDTO.RecipientInfoDTO(
                        row.getRecipientName(),
                        row.getRecipientPhone(),
                        row.getAddressLine(),
                        row.getWard(),
                        row.getDistrict(),
                        row.getCity(),
                        row.getPostalCode()
                ),
				itemDTOs,
				historyDTOs
        );
    }
    

        @Transactional(readOnly = true)
    public List<OrderShipmentByShopResponseDTO> getShipmentsByShopId(Long shopId,String status, int page, int size, String sortBy, String sortOrder, String search,String paymentStatus) {
        	
        List<OrderShipmentWithOrderAndRecipientProjection> rows = orderShipmentRepository.findShipmentDetailsByShopId(shopId,status, paymentStatus);
        System.out.println("Fetched " + rows.size() + " shipments for shopId: " + shopId);
        System.out.println("Total amount of first shipment: " + (rows.isEmpty() ? "N/A" : rows.get(0).getTotalAmount()));
        List<Long> shipmentIds = rows.stream()
                .map(OrderShipmentWithOrderAndRecipientProjection::getShipmentId)
                .toList();

        Map<Long, List<OrderShipmentByShopResponseDTO.OrderItemInfoDTO>> itemsByShipmentId = orderItemRepository
                .findByShipmentIdIn(shipmentIds)
                .stream()
                .collect(Collectors.groupingBy(
                        OrderItem::getShipmentId,
                        Collectors.mapping(item -> new OrderShipmentByShopResponseDTO.OrderItemInfoDTO(
                                        item.getId(),
                                        item.getProductId(),
                                        item.getVariantId(),
                                        item.getProductName(),
                                        item.getVariantName(),
                                        item.getImage(),
                                        item.getQuantity(),
                                        item.getPrice(),
                                        item.getTotalPrice(),
                                        item.getShopVoucherDiscountAmount(),
                                        item.getPlatformVoucherDiscountAmount(),
                                        item.getTotalVoucherDiscountAmount(),
                                        item.getTotalAfterShopVoucher(),
                                        item.getTotalAfterAllVouchers(),
                                        item.getPlatformCommissionRate(),
                                        item.getPlatformCommissionAmount(),
                                        item.getSellerReceivableAmount()
                                ),
                                Collectors.toList())
                ));

        return rows.stream()
                .map(row -> new OrderShipmentByShopResponseDTO(
                        row.getShipmentId(),
                        row.getOrderId(),
                        row.getShopId(),
                        row.getShopName(),
                        row.getShippingFee(),
                  Long.valueOf(row.getTotalAmount().longValue()),
                        row.getCarrierName(),
                        row.getTrackingNumber(), 
                        row.getShippingStatus(),
                        new OrderShipmentByShopResponseDTO.OrderInfoDTO(
                                row.getOrderNumber(),
                                row.getUserId(),
                                row.getAddressId(),
                                row.getTotalAmount(),
                                row.getShippingFee(),
                                row.getDiscountAmount(),
                                row.getFinalAmount(),
                                row.getPaymentMethod(),
                                row.getPaymentStatus(),
                                row.getOrderStatus()
                        ),
                        new OrderShipmentByShopResponseDTO.RecipientInfoDTO(
                                row.getRecipientName(),
                                row.getRecipientPhone(),
                                row.getAddressLine(),
                                row.getWard(),
                                row.getDistrict(),
                                row.getCity(),
                                row.getPostalCode()
                        ),
                        itemsByShipmentId.getOrDefault(row.getShipmentId(), List.of())
                ))
                .toList();
    }

    @Transactional
    public ConfirmPackagedResponseDTO confirmPackagedAndRequestLogistics(Long shipmentId) {
        OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        if ("ADJUSTMENT_PENDING_BUYER".equalsIgnoreCase(shipment.getBusinessStatus())) {
            throw new RuntimeException("Shipment is waiting for buyer adjustment approval");
        }

        if (!"PENDING".equalsIgnoreCase(shipment.getShippingStatus())) {
            throw new RuntimeException("Shipment is not in PENDING status");
        }
        System.out.println("Requesting logistics for shipment: " + shipment);

        Map<String, Object> logisticsResponse = webClient.post()
                .uri(logisticsServiceUrl + "/api/logistics/shipments")
                .bodyValue(Map.of(
                        "orderShipmentRefId", shipmentId,
                        "status", "CONFIRMED"
                ))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (logisticsResponse == null || logisticsResponse.get("trackingCode") == null) {
            throw new RuntimeException("Logistics did not return tracking code");
        }    

        String trackingCode = String.valueOf(logisticsResponse.get("trackingCode"));
        String shippingStatus = String.valueOf(logisticsResponse.get("status"));

        shipment.setTrackingNumber(trackingCode);
        shipment.setShippingStatus(shippingStatus);
        orderShipmentRepository.save(shipment);

        Order order = orderRepository.findById(shipment.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + shipment.getOrderId()));
        order.setTrackingNumber(trackingCode);
        orderRepository.save(order);

        return new ConfirmPackagedResponseDTO(
                shipment.getId(),
                shipment.getOrderId(),
                trackingCode,
                shippingStatus,
                "Logistics confirmed. Tracking code updated"				
        );
    }

    @Transactional
    public ConfirmReceivedResponseDTO confirmReceived(Long shipmentId) {
        OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        String currentStatus = shipment.getShippingStatus() == null
                ? ""
                : shipment.getShippingStatus().toUpperCase(Locale.ROOT);

        if (!"DELIVERED".equals(currentStatus)) {
            throw new RuntimeException("Only DELIVERED shipment can be confirmed as received");
        }

        shipment.setShippingStatus("COMPLETED");
        orderShipmentRepository.save(shipment);
        calculatePlatformCommissionForShipmentItems(shipment.getId());

        persistShipmentHistory(
                shipment.getId(),
                currentStatus,
                "COMPLETED",
                "buyer",
                "buyer confirmed received"
        );

        updateOrderStatusFromShipments(shipment.getOrderId());

        return new ConfirmReceivedResponseDTO(
                shipment.getId(),
                shipment.getOrderId(),
                currentStatus,
                shipment.getShippingStatus(),
                "Shipment marked as COMPLETED"
        );
    }

    private void calculatePlatformCommissionForShipmentItems(Long shipmentId) {
        List<OrderItem> items = orderItemRepository.findByShipmentId(shipmentId);
        LocalDateTime calculatedAt = LocalDateTime.now();

        items.forEach(item -> {
            double commissionBase = getCommissionBase(item);
            double commissionAmount = roundMoney(commissionBase * PLATFORM_COMMISSION_RATE);
            double sellerReceivableAmount = roundMoney(Math.max(0.0, commissionBase - commissionAmount));

            item.setPlatformCommissionRate(PLATFORM_COMMISSION_RATE);
            item.setPlatformCommissionAmount(commissionAmount);
            item.setSellerReceivableAmount(sellerReceivableAmount);
            item.setCommissionCalculatedAt(calculatedAt);
        });

        orderItemRepository.saveAll(items);
    }

    private double getCommissionBase(OrderItem item) {
        double totalAfterShopVoucher = safeMoney(item.getTotalAfterShopVoucher());
        if (totalAfterShopVoucher > 0) {
            return totalAfterShopVoucher;
        }

        double totalPrice = safeMoney(item.getTotalPrice());
        double shopVoucherDiscount = safeMoney(item.getShopVoucherDiscountAmount());

        return Math.max(0.0, totalPrice - shopVoucherDiscount);
    }

    private double safeMoney(Double value) {
        if (value == null || value.isNaN() || value.isInfinite() || value < 0) {
            return 0.0;
        }
        return value;
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    @Transactional
    public CreateAdjustmentResponseDTO createAdjustmentRequest(Long shipmentId, CreateAdjustmentRequestDTO request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new RuntimeException("Adjustment items are required");
        }

        OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        if (!"PENDING".equalsIgnoreCase(shipment.getShippingStatus())) {
            throw new RuntimeException("Only PENDING shipment can create adjustment request");
        }

        shipmentAdjustmentRequestRepository
                .findFirstByOrderShipmentIdAndStatus(shipmentId, "PENDING_BUYER")
                .ifPresent(existing -> {
                    throw new RuntimeException("This shipment already has a pending adjustment request");
                });

        ShipmentAdjustmentRequest adjustmentRequest = ShipmentAdjustmentRequest.builder()
                .requestCode("ADJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT))
                .orderShipmentId(shipment.getId())
                .orderId(shipment.getOrderId())
                .shopId(shipment.getShopId())
                .status("PENDING_BUYER")
                .shopReason(request.shopReason())
                .totalOriginalAmount(0.0)
                .totalAdjustedAmount(0.0)
                .totalDiffAmount(0.0)
                .build();

        ShipmentAdjustmentRequest savedRequest = shipmentAdjustmentRequestRepository.save(adjustmentRequest);

        for (CreateAdjustmentRequestDTO.AdjustmentItemDTO itemRequest : request.items()) {
            if (itemRequest.orderItemId() == null || itemRequest.newQuantity() == null) {
                throw new RuntimeException("orderItemId and newQuantity are required");
            }

            OrderItem orderItem = orderItemRepository
                    .findByIdAndShipmentId(itemRequest.orderItemId(), shipmentId)
                    .orElseThrow(() -> new RuntimeException("Order item does not belong to shipment: " + itemRequest.orderItemId()));

            if (itemRequest.newQuantity() < 0 || itemRequest.newQuantity() > orderItem.getQuantity()) {
                throw new RuntimeException("newQuantity must be between 0 and current quantity");
            }

            ShipmentAdjustmentItem adjustmentItem = ShipmentAdjustmentItem.builder()
                    .adjustmentRequestId(savedRequest.getId())
                    .orderItemId(orderItem.getId())
                    .productId(orderItem.getProductId())
                    .variantId(orderItem.getVariantId())
                    .productName(orderItem.getProductName())
                    .variantName(orderItem.getVariantName())
                    .oldQuantity(orderItem.getQuantity())
                    .newQuantity(itemRequest.newQuantity())
                    .unitPrice(orderItem.getPrice())
                    .oldTotal(orderItem.getPrice() * orderItem.getQuantity())
                    .newTotal(orderItem.getPrice() * itemRequest.newQuantity())
                    .diffTotal(orderItem.getPrice() * (orderItem.getQuantity() - itemRequest.newQuantity()))
                    .build();

            shipmentAdjustmentItemRepository.save(adjustmentItem);
        }

        shipment.setBusinessStatus("ADJUSTMENT_PENDING_BUYER");
        shipment.setAdjustmentRequired(Boolean.TRUE);
        shipment.setLatestAdjustmentRequestId(savedRequest.getId());
        orderShipmentRepository.save(shipment);

        return new CreateAdjustmentResponseDTO(
                savedRequest.getId(),
                savedRequest.getRequestCode(),
                savedRequest.getStatus(),
                "Adjustment request created and waiting buyer confirmation"
        );
    }

    @Transactional(readOnly = true)
    public GetAdjustmentRequestDTO getAdjustmentRequest(Long shipmentId) {
        OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        Long adjustmentRequestId = shipment.getLatestAdjustmentRequestId();
        if (adjustmentRequestId == null) {
            return null;
        }

        ShipmentAdjustmentRequest adjustmentRequest = shipmentAdjustmentRequestRepository.findById(adjustmentRequestId)
                .orElse(null);

        if (adjustmentRequest == null) {
            return null;
        }

        List<ShipmentAdjustmentItem> items = shipmentAdjustmentItemRepository.findByAdjustmentRequestId(adjustmentRequestId);
        List<GetAdjustmentRequestDTO.AdjustmentItemDTO> itemDTOs = items.stream()
                .map(item -> new GetAdjustmentRequestDTO.AdjustmentItemDTO(
                        item.getId(),
                        item.getOrderItemId(),
                        item.getProductId(),
                        item.getVariantId(),
                        item.getProductName(),
                        item.getVariantName(),
                        item.getOldQuantity(),
                        item.getNewQuantity(),
                        item.getUnitPrice(),
                        item.getOldTotal(),
                        item.getNewTotal(),
                        item.getDiffTotal()
                ))
                .toList();

        return new GetAdjustmentRequestDTO(
                adjustmentRequest.getId(),
                adjustmentRequest.getRequestCode(),
                adjustmentRequest.getOrderShipmentId(),
                adjustmentRequest.getOrderId(),
                adjustmentRequest.getShopId(),
                adjustmentRequest.getStatus(),
                adjustmentRequest.getShopReason(),
                adjustmentRequest.getBuyerNote(),
                adjustmentRequest.getTotalOriginalAmount(),
                adjustmentRequest.getTotalAdjustedAmount(),
                adjustmentRequest.getTotalDiffAmount(),
                adjustmentRequest.getExpiresAt(),
                adjustmentRequest.getRespondedAt(),
                adjustmentRequest.getCreatedAt(),
                adjustmentRequest.getUpdatedAt(),
                itemDTOs
        );
    }

    @Transactional
    public CancelShipmentByOosResponseDTO cancelShipmentByOutOfStock(Long shipmentId, CancelShipmentByOosRequestDTO request) {
        OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        if (!"PENDING".equalsIgnoreCase(shipment.getShippingStatus())) {
            throw new RuntimeException("Only PENDING shipment can be canceled by out-of-stock");
        }

        shipment.setShippingStatus("CANCELED");
        shipment.setBusinessStatus("CANCELLED_BY_OOS");
        shipment.setAdjustmentRequired(Boolean.FALSE);
        orderShipmentRepository.save(shipment);

        return new CancelShipmentByOosResponseDTO(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getShippingStatus(),
                shipment.getBusinessStatus(),
                request != null && request.reason() != null && !request.reason().isBlank()
                        ? "Shipment canceled by out-of-stock: " + request.reason()
                        : "Shipment canceled by out-of-stock"
        );
    }

    @Transactional
    public CancelShipmentByOosResponseDTO cancelPendingShipmentByBuyer(Long shipmentId, CancelShipmentRequestDTO request) {
        OrderShipment shipment = orderShipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        String currentStatus = shipment.getShippingStatus() == null
                ? ""
                : shipment.getShippingStatus().toUpperCase(Locale.ROOT);

        if (!"PENDING".equals(currentStatus)) {
            throw new RuntimeException("Only PENDING shipment can be canceled by buyer");
        }

        Order order = orderRepository.findById(shipment.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + shipment.getOrderId()));

        if (request != null && request.userId() != null && !request.userId().equals(order.getUserId())) {
            throw new RuntimeException("Buyer can only cancel their own shipment");
        }

        shipment.setShippingStatus("CANCELED");
        shipment.setBusinessStatus("CANCELLED_BY_BUYER");
        shipment.setAdjustmentRequired(Boolean.FALSE);
        orderShipmentRepository.save(shipment);

        persistShipmentHistory(
                shipment.getId(),
                currentStatus,
                "CANCELED",
                "buyer",
                request != null && request.reason() != null && !request.reason().isBlank()
                        ? request.reason()
                        : "buyer canceled pending shipment"
        );

        updateOrderStatusAfterShipmentCanceled(shipment.getOrderId());

        return new CancelShipmentByOosResponseDTO(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getShippingStatus(),
                shipment.getBusinessStatus(),
                "Shipment canceled by buyer"
        );
    }

        @Transactional
        public void applyShipmentStatusEvent(ShipmentStatusUpdatedEvent event) {
                if (event == null || event.getTrackingCode() == null || event.getTrackingCode().isBlank()) {
                        throw new IllegalArgumentException("tracking_code is required");
                }
                if (event.getStatus() == null || event.getStatus().isBlank()) {
                        throw new IllegalArgumentException("status is required");
                }

                String normalizedStatus = event.getStatus().toUpperCase(Locale.ROOT);

                OrderShipment shipment = orderShipmentRepository.findFirstByTrackingNumber(event.getTrackingCode())
                                .orElseThrow(() -> new RuntimeException("Shipment not found by tracking code: " + event.getTrackingCode()));

                shipment.setShippingStatus(normalizedStatus);
                orderShipmentRepository.save(shipment);

                Order order = orderRepository.findById(shipment.getOrderId())
                                .orElseThrow(() -> new RuntimeException("Order not found: " + shipment.getOrderId()));
                order.setTrackingNumber(event.getTrackingCode());

                String mappedOrderStatus = mapShipmentStatusToOrderStatus(normalizedStatus);
                if (mappedOrderStatus != null) {
                        order.setOrderStatus(mappedOrderStatus);
                }
                orderRepository.save(order);
        }

        private String mapShipmentStatusToOrderStatus(String shipmentStatus) {
                return switch (shipmentStatus) {
                        case "PENDING" -> "PENDING";
                        case "CONFIRMED" -> "CONFIRMED";
                        case "PICKED_UP", "SHIPPING", "DELIVERING" -> "SHIPPED";
                        case "DELIVERED" -> "COMPLETED";
                        case "FAILED", "RETURNED" -> "CANCELED";
                        default -> null;
                };
        }

            private void persistShipmentHistory(
                    Long shipmentId,
                    String oldStatus,
                    String newStatus,
                    String changedBy,
                    String note
            ) {
                OrderShipmentStatusHistory history = OrderShipmentStatusHistory.builder()
                        .orderShipmentId(shipmentId)
                        .oldStatus(oldStatus)
                        .newStatus(newStatus)
                        .changedAt(LocalDateTime.now())
                        .changedBy(changedBy)
                        .note(note)
                        .build();
                orderShipmentStatusHistoryRepository.save(history);
            }

            private void updateOrderStatusFromShipments(Long orderId) {
                List<OrderShipment> shipments = orderShipmentRepository.findByOrderIdOrderByIdDesc(orderId);
                if (shipments.isEmpty()) {
                    return;
                }

                boolean allCompleted = shipments.stream()
                        .allMatch(s -> "COMPLETED".equalsIgnoreCase(s.getShippingStatus()));

                Order order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

                if (allCompleted) {
                    order.setOrderStatus("COMPLETED");
                } else if (!"CANCELED".equalsIgnoreCase(order.getOrderStatus())) {
                    order.setOrderStatus("SHIPPED");
                }

                orderRepository.save(order);
            }

            private void updateOrderStatusAfterShipmentCanceled(Long orderId) {
                List<OrderShipment> shipments = orderShipmentRepository.findByOrderIdOrderByIdDesc(orderId);
                if (shipments.isEmpty()) {
                    return;
                }

                boolean allCanceled = shipments.stream()
                        .allMatch(s -> "CANCELED".equalsIgnoreCase(s.getShippingStatus()));

                if (!allCanceled) {
                    return;
                }

                Order order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
                order.setOrderStatus("CANCELED");
                orderRepository.save(order);
            }
}
