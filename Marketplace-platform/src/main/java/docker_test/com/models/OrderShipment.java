package docker_test.com.models;

import org.springframework.boot.persistence.autoconfigure.EntityScan;


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

	    @Column(name = "business_status")
	    private String businessStatus;

	    @Column(name = "latest_adjustment_request_id")
	    private Long latestAdjustmentRequestId;

	    @Column(name = "adjusted_total_amount")
	    private Double adjustedTotalAmount;

	    @Column(name = "adjustment_required", nullable = false)
	    private Boolean adjustmentRequired;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public Long getShopId() {
		return shopId;
	}

	public void setShopId(Long shopId) {
		this.shopId = shopId;
	}

	public String getTrackingNumber() {
		return trackingNumber;
	}

	public void setTrackingNumber(String trackingNumber) {
		this.trackingNumber = trackingNumber;
	}

	public Double getShippingFee() {
		return shippingFee;
	}

	public void setShippingFee(Double shippingFee) {
		this.shippingFee = shippingFee;
	}

	public Double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getCarrierName() {
		return carrierName;
	}

	public void setCarrierName(String carrierName) {
		this.carrierName = carrierName;
	}

	public String getShippingStatus() {
		return shippingStatus;
	}

	public void setShippingStatus(String shippingStatus) {
		this.shippingStatus = shippingStatus;
	}

	public String getBusinessStatus() {
		return businessStatus;
	}

	public void setBusinessStatus(String businessStatus) {
		this.businessStatus = businessStatus;
	}

	public Long getLatestAdjustmentRequestId() {
		return latestAdjustmentRequestId;
	}

	public void setLatestAdjustmentRequestId(Long latestAdjustmentRequestId) {
		this.latestAdjustmentRequestId = latestAdjustmentRequestId;
	}

	public Double getAdjustedTotalAmount() {
		return adjustedTotalAmount;
	}

	public void setAdjustedTotalAmount(Double adjustedTotalAmount) {
		this.adjustedTotalAmount = adjustedTotalAmount;
	}

	public Boolean getAdjustmentRequired() {
		return adjustmentRequired;
	}

	public void setAdjustmentRequired(Boolean adjustmentRequired) {
		this.adjustmentRequired = adjustmentRequired;
	}
}
