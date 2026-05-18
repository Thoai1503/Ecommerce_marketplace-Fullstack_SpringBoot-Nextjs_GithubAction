package docker_test.com.models.refunds;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "return_request")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReturnRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id", nullable = false)
    private Long orderId;
    
//    @Column(name = "order_item_id", nullable = false)
//    private Long orderItemId;
    
    @Column(name = "shop_id", nullable = false)
    private Long shopId;
    
    @Column(name ="customer_id", nullable = false)
    private Long customerId;
    
    
    @Column(name = "order_shipment_id", nullable = false)
    private Long orderShipmentId;
    
    @Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
    @Builder.Default
    private ReturnRequestStatus status = ReturnRequestStatus.PENDING_APPROVAL;
    
    
    @Column(name = "reason", length = 1000)
    private String reason;
    
    @Column(name = "quantity", nullable = false)
    private int quantity;
    
    @Column(name = "requested_amount", nullable = false)
    private double requestedAmount;
    
    @JsonManagedReference("return-request-items")
    @OneToMany(mappedBy = "returnRequest", fetch = jakarta.persistence.FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReturnRequestItem> items = new java.util.ArrayList<>();
    
    @JsonManagedReference("return-request-attachments")
    @OneToMany(mappedBy = "returnRequest", fetch = jakarta.persistence.FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReturnRequestAttachment> attachments = new java.util.ArrayList<>();
    
    @Column(name = "refunded_amount")
    private double refundedAmount;
    
    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

   

  
}
