package docker_test.com.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.OrderShipment;
import docker_test.com.repository.OrderShipmentRepository;

@RestController()
@RequestMapping("/seller/order-shipment")
public class SellerOrderShipmentController {

    private final OrderShipmentRepository orderShipmentRepository;

    public SellerOrderShipmentController(OrderShipmentRepository orderShipmentRepository) {
        this.orderShipmentRepository = orderShipmentRepository;
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getShipmentsByShopId(@PathVariable String shopId) {
        Long shopIdValue;
        try {
            shopIdValue = Long.valueOf(shopId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "shopId must be a number"));
        }

        List<OrderShipment> shipments = orderShipmentRepository.findByShopId(shopIdValue);

        var list = shipments.stream().map(shipment -> Map.of(
                "id", shipment.getId(),
                "order_id", shipment.getOrderId(),
                "shop_id", shipment.getShopId(),
                "tracking_number", shipment.getTrackingNumber(),
                "carrier_name", shipment.getCarrierName(),
                "shipping_status", shipment.getShippingStatus()
        )).toList();

        return ResponseEntity.ok(list);
    }
}
