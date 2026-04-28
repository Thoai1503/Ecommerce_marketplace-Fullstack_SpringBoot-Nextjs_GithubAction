<<<<<<< HEAD
//package docker_test.com.controllers.seller;
=======
//	package docker_test.com.controllers.seller;
>>>>>>> 1baaa4b887a4d539478b503d2ca6afaa6be25518
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
<<<<<<< HEAD
//@RestController
=======
//@RestController("sellerOrderShipmentController")
>>>>>>> 1baaa4b887a4d539478b503d2ca6afaa6be25518
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
<<<<<<< HEAD
//	            public String shop_id = shipment.getShopId();
=======
//	            public Long shop_id = shipment.getShopId();
>>>>>>> 1baaa4b887a4d539478b503d2ca6afaa6be25518
//	            public String tracking_number = shipment.getTrackingNumber();
//	            public String carrier_name = shipment.getCarrierName();
//	            public String shipping_status = shipment.getShippingStatus();
//	        };
//	    }).toList();
//	    return ResponseEntity.ok(list);
//	}
<<<<<<< HEAD
//}
=======
//}
>>>>>>> 1baaa4b887a4d539478b503d2ca6afaa6be25518
