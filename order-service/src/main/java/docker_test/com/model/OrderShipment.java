package docker_test.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "order_shipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OrderShipment {
    @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	 	private Long id;
    
    @Column(name = "order_id", nullable = false)
	private Long orderId;
    
    @Column(name = "shop_id", nullable = false)
	private Long shopId;
    @Column(name = "tracking_number", nullable = false)
	private String trackingNumber;
     @Column(name = "carrier_name", nullable = false)
	private String carrierName;
     @Column(name = "shipping_status", nullable = false)	
	private String shippingStatus;
	
}

