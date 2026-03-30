package docker_test.com.model;

import java.time.LocalDateTime;

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
@Table(name = "order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class OrderItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "order_id", nullable = false)
	private Long orderId;
	
	@Column(name = "product_id", nullable = false)
	private Long productId;
	
	@Column(name = "shop_id", nullable = false)
	private Long shopId;
	
	@Column(name = "shipment_id", nullable = false)
	private Long shipmentId;
	
	@Column(name = "variant_id", nullable = false)
	private Long variantId;
	
	@Column(name = "product_name", nullable = false)
	private String productName;
	
	@Column(name = "variant_name", nullable = false)
	private String variantName;
	
	@Column(name = "quantity", nullable = false)
	private Integer quantity;
	
	@Column(name = "price", nullable = false)
	private Double price;
	
	@Column(name = "total_price", nullable = false)
	private Double totalPrice;
	
//	@Column(name = "created_at", nullable = false)
//	private LocalDateTime createdAt;
}
