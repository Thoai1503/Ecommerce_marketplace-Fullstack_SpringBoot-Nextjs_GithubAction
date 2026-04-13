package docker_test.com.service;

import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import docker_test.com.dto.ConfirmPackagedResponseDTO;
import docker_test.com.dto.OrderShipmentByShopResponseDTO;
import docker_test.com.dto.OrderShipmentResponeDTO;
import docker_test.com.dto.ShipmentStatusUpdatedEvent;
import docker_test.com.model.Order;
import docker_test.com.model.OrderItem;
import docker_test.com.model.OrderShipment;
import docker_test.com.model.OrderShipmentStatusHistory;
import docker_test.com.repository.OrderRepository;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.repository.OrderShipmentStatusHistoryRepository;
import docker_test.com.repository.OrderShipmentWithOrderAndRecipientProjection;

@Service
public class OrderShipmentService {

    private final OrderShipmentRepository orderShipmentRepository;
    private final OrderItemRepository orderItemRepository;
        private final OrderShipmentStatusHistoryRepository orderShipmentStatusHistoryRepository;
        private final OrderRepository orderRepository;
        private final WebClient webClient;

        @Value("${logistics.service.url:http://localhost:8007}")
        private String logisticsServiceUrl;

    public OrderShipmentService(OrderShipmentRepository orderShipmentRepository,
                                                                OrderItemRepository orderItemRepository,
                                                                OrderShipmentStatusHistoryRepository orderShipmentStatusHistoryRepository,
                                                                OrderRepository orderRepository,
                                                                WebClient webClient) {
        this.orderShipmentRepository = orderShipmentRepository;
        this.orderItemRepository = orderItemRepository;	
                this.orderShipmentStatusHistoryRepository = orderShipmentStatusHistoryRepository;
                this.orderRepository = orderRepository;
                this.webClient = webClient;
    }
    
    public OrderShipmentResponeDTO getShipmentById(Long shipmentId) {
        OrderShipmentWithOrderAndRecipientProjection row = orderShipmentRepository.findShipmentDetailsById(shipmentId)
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
						item.getTotalPrice()
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
                row.getShippingFee(),
                Long.valueOf(row.getTotalAmount().longValue()),
                row.getCarrierName(),
                row.getTrackingNumber(), 
                row.getShippingStatus(),
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
    public List<OrderShipmentByShopResponseDTO> getShipmentsByShopId(Long shopId) {
        List<OrderShipmentWithOrderAndRecipientProjection> rows = orderShipmentRepository.findShipmentDetailsByShopId(shopId);
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
                                        item.getTotalPrice()
                                ),
                                Collectors.toList())
                ));

        return rows.stream()
                .map(row -> new OrderShipmentByShopResponseDTO(
                        row.getShipmentId(),
                        row.getOrderId(),
                        row.getShopId(),
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
}
