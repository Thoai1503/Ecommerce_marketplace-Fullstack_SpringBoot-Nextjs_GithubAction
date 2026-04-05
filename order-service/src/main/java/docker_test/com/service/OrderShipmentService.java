package docker_test.com.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import docker_test.com.dto.OrderShipmentByShopResponseDTO;
import docker_test.com.model.OrderItem;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.repository.OrderShipmentWithOrderAndRecipientProjection;

@Service
public class OrderShipmentService {

    private final OrderShipmentRepository orderShipmentRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderShipmentService(OrderShipmentRepository orderShipmentRepository,
                                OrderItemRepository orderItemRepository) {
        this.orderShipmentRepository = orderShipmentRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<OrderShipmentByShopResponseDTO> getShipmentsByShopId(Long shopId) {
        List<OrderShipmentWithOrderAndRecipientProjection> rows = orderShipmentRepository.findShipmentDetailsByShopId(shopId);

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
}
