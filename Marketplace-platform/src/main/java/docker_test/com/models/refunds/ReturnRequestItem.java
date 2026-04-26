package docker_test.com.models.refunds;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
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
     
     @Column(name = "refunded_amount")
     private double refundedAmount;
     
     @Column(name = "created_at", nullable = false)
     private LocalDateTime createdAt;
     
     @Column(name = "updated_at")
     private LocalDateTime updatedAt;
     
     
     @PrePersist
     public void prePersist() {
		 this.createdAt = LocalDateTime.now();
		// this.updatedAt = LocalDateTime.now();
	 }

     public Long getId() {
          return id;
     }

     public void setId(Long id) {
          this.id = id;
     }

     public Long getReturnRequestId() {
          return returnRequestId;
     }

     public void setReturnRequestId(Long returnRequestId) {
          this.returnRequestId = returnRequestId;
     }

     public Long getOrderItemId() {
          return orderItemId;
     }

     public void setOrderItemId(Long orderItemId) {
          this.orderItemId = orderItemId;
     }

     public int getQuantity() {
          return quantity;
     }

     public void setQuantity(int quantity) {
          this.quantity = quantity;
     }

     public double getRequestedAmount() {
          return requestedAmount;
     }

     public void setRequestedAmount(double requestedAmount) {
          this.requestedAmount = requestedAmount;
     }

     public double getRefundedAmount() {
          return refundedAmount;
     }

     public void setRefundedAmount(double refundedAmount) {
          this.refundedAmount = refundedAmount;
     }

     public LocalDateTime getCreatedAt() {
          return createdAt;
     }

     public void setCreatedAt(LocalDateTime createdAt) {
          this.createdAt = createdAt;
     }

     public LocalDateTime getUpdatedAt() {
          return updatedAt;
     }

     public void setUpdatedAt(LocalDateTime updatedAt) {
          this.updatedAt = updatedAt;
     }
}
