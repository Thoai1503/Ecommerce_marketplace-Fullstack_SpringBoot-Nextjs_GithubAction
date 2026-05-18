package docker_test.com.dto;

import java.util.List;

public class OrderShipmentSnapshotDTO {
    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	private Long id;
	private Long orderId;
	private Long shopId;
	private Double totalAmount;
	private Double subtotal;
	public Double getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(Double subtotal) {
		this.subtotal = subtotal;
	}

	public Double getTotalAfterVoucher() {
		return totalAfterVoucher;
	}

	public void setTotalAfterVoucher(Double totalAfterVoucher) {
		this.totalAfterVoucher = totalAfterVoucher;
	}

	private Double totalAfterVoucher;
	private String carrierName;
	private Double shippingFee;
	private String trackingNumber;
	private String shippingStatus;
	private List<Long> voucherIds;

	public List<Long> getVoucherIds() {
		return voucherIds;
	}

	public void setVoucherIds(List<Long> voucherIds) {
		this.voucherIds = voucherIds;
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

	public Double getShippingFee() {
		return shippingFee;
	}

	public void setShippingFee(Double shippingFee) {
		this.shippingFee = shippingFee;
	}

	public String getTrackingNumber() {
		return trackingNumber;
	}

	public void setTrackingNumber(String trackingNumber) {
		this.trackingNumber = trackingNumber;
	}

	public String getShippingStatus() {
		return shippingStatus;
	}

	public void setShippingStatus(String shippingStatus) {
		this.shippingStatus = shippingStatus;
	}
}
