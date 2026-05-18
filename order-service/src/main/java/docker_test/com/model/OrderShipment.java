package docker_test.com.model;


import java.util.List;

import org.springframework.boot.persistence.autoconfigure.EntityScan;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
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
	    @Column(name = "tracking_number")
		private String trackingNumber;
	    @Column(name = "shipping_fee", nullable = false)
	    	private Double shippingFee;
	     @Column(name = "total_amount", nullable = false)
	     		private Double totalAmount;
	     @Column(name = "carrier_name", nullable = false)
		private String carrierName;
	     @Column(name = "shipping_status", nullable = false)	
		private String shippingStatus;

	     @JdbcTypeCode(SqlTypes.JSON)
	     @Column(name = "voucher_id", columnDefinition = "json")

	     private List<Long> voucherIds;
	     
	    @Column(name = "business_status")
	    private String businessStatus;
	    
	    @Column(name = "subtotal")
	    private Double subtotal;
	    
	    
	    @Column(name = "total_after_voucher")
	    private Double totalAfterVoucher;

	    @Column(name = "latest_adjustment_request_id")
	    private Long latestAdjustmentRequestId;

	    @Column(name = "adjusted_total_amount")
	    private Double adjustedTotalAmount;

	    @Column(name = "adjustment_required", nullable = false)
	    private Boolean adjustmentRequired;
	    
	    @Column(name ="return_status_summary")
 	    private String returnStatusSummary;

}
