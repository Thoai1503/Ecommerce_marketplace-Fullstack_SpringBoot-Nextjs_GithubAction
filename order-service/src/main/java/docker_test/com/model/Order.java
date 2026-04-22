package docker_test.com.model;

import java.time.LocalDateTime;


import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


// Lưu ý: Các trường như created_at, updated_at có thể được tự động quản lý bởi JPA nếu bạn sử dụng @CreationTimestamp và @UpdateTimestamp
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Order {
      @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    
      @Column(name = "user_id", nullable = false)
      private Long userId;
      
      @Column(name = "order_number", nullable = false, unique = true)
      private String orderNumber;
      
      @Column(name = "address_id", nullable = false)
      private Long addressId;
      
      
      
      @Column(name = "total_amount", nullable = false)
      private Double totalAmount;
      
      @Column(name = "shipping_fee", nullable = false)
      private Long shippingFee;
      
      @Column(name = "discount_amount", nullable = false)
      private Long discountAmount;
      
      @Column(name = "final_amount", nullable = false)
      private Long finalAmount;
      
      @Column(name = "payment_status", nullable = true)
      private String paymentStatus;
      
      
      @Column(name = "payment_method", nullable = false)
      private String paymentMethod;
      
      @Column(name = "order_status", nullable = false)
      private String orderStatus;
      
      @Column(name = "tracking_number", nullable = true)
      private String trackingNumber;
}
