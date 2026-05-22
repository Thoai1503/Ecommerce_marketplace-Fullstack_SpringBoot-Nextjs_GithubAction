package docker_test.com.models.refunds;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "return_request_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestItem {
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;
     
     @Column(name = "return_request_id", nullable = false)
     private Long returnRequestId;
     
     @Column(name="order_item_id", nullable = false)
     private Long orderItemId;
     
     @Column(name ="quantity", nullable = false)
     private int quantity;
     
     @Column(name = "requested_amount", nullable = false)
     private double requestedAmount;

     @Column(name = "approved_amount")
     private Double approvedAmount;
     
     @Column(name = "refunded_amount")
     private double refundedAmount;
     
     @Column(name = "created_at", nullable = false)
     private LocalDateTime createdAt;
     
     @Column(name = "updated_at")
     private LocalDateTime updatedAt;

     @Transient
     private String productName;

     @Transient
     private String variantName;

     @Transient
     private String productImage;

     @Transient
     private double price;

     @Transient
     private double totalPrice;

     @Transient
     private double totalAfterShopVoucher;

     @Transient
     private double totalAfterAllVouchers;

     @Transient
     private int orderQuantity;
     
     
     @JsonBackReference("return-request-items")
     @ManyToOne
     @JoinColumn(name = "return_request_id", insertable = false, updatable = false, nullable = false)
     private ReturnRequest returnRequest;
     
     @PrePersist
     public void prePersist() {
		 this.createdAt = LocalDateTime.now();
		// this.updatedAt = LocalDateTime.now();
	 }

   
}
