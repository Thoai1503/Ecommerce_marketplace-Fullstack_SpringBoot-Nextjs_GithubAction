package docker_test.com.dto;

import java.util.List;

public class RefundRequestDTO {
    private Long returnRequestId;
    private Long orderId;
	private Long orderItemId;
	private Long orderShipmentId;
	private RecipientDTO recipient;
	private RecipientDTO pickupContact;
	private String description;

	public Long getReturnRequestId() {
		return returnRequestId;
	}

	public void setReturnRequestId(Long returnRequestId) {
		this.returnRequestId = returnRequestId;
	}

	public Long getOrderShipmentId() {
		return orderShipmentId;
	}

	public void setOrderShipmentId(Long orderShipmentId) {
		this.orderShipmentId = orderShipmentId;
	}

	public RecipientDTO getRecipient() {
		return recipient;
	}

	public void setRecipient(RecipientDTO recipient) {
		this.recipient = recipient;
	}

	public RecipientDTO getPickupContact() {
		return pickupContact;
	}

	public void setPickupContact(RecipientDTO pickupContact) {
		this.pickupContact = pickupContact;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	private Long shopId;
	private Long customerId;
	private String reason;
	private int quantity;
	private double requestedAmount;
	private List<RequestItemDTO> items;
	private List<ReturnRequestAttachmentDTO> attachments;

	public List<RequestItemDTO> getItems() {
		return items;
	}

	public void setItems(List<RequestItemDTO> items) {
		this.items = items;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public Long getOrderItemId() {
		return orderItemId;
	}

	public void setOrderItemId(Long orderItemId) {
		this.orderItemId = orderItemId;
	}

	public Long getShopId() {
		return shopId;
	}

	public void setShopId(Long shopId) {
		this.shopId = shopId;
	}

	public Long getCustomerId() {
		return customerId;
	}

	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
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

	public List<ReturnRequestAttachmentDTO> getAttachments() {
		return attachments;
	}

	public void setAttachments(List<ReturnRequestAttachmentDTO> attachments) {
		this.attachments = attachments;
	}
}
