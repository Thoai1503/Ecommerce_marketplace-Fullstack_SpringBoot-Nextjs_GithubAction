//package docker_test.com.controllers.seller;
//
//import java.util.List;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import docker_test.com.models.OrderShipment;
//import docker_test.com.repository.OrderShipmentRepository;
//
//@RestController
//@RequestMapping("/seller/order-shipment")
//public class OrderShipmentController {
//	
//	private final OrderShipmentRepository orderShipmentRepository;
//	
//	public OrderShipmentController(OrderShipmentRepository orderShipmentRepository) {
//		this.orderShipmentRepository = orderShipmentRepository;
//	}
//	
//          
//	@GetMapping("/shop/{shopId}")
//	public ResponseEntity getShipmentsByShopId(@PathVariable String shopId) {
//		System.out.println("Received request to get shipments for shopId: " + shopId);
//	    List<OrderShipment> shipments = orderShipmentRepository.findByShopId(shopId);
////	    var response = new Object() {
////	        public String message = "Shipments retrieved successfully";
////	        public List<OrderShipment> data = shipments;
////	    };
//	    
//	    var list = shipments.stream().map(shipment -> {
//	        return new Object() {
//	            public Long id = shipment.getId();
//	            public Long order_id = shipment.getOrderId();
//	            public String shop_id = shipment.getShopId();
//	            public String tracking_number = shipment.getTrackingNumber();
//	            public String carrier_name = shipment.getCarrierName();
//	            public String shipping_status = shipment.getShippingStatus();
//	        };
//	    }).toList();
//	    return ResponseEntity.ok(list);
//	}
//}