package docker_test.com.dto;


public class OrderCreatedEvent {

    public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public OrderDTO getOrder() {
		return order;
	}
	public void setOrder(OrderDTO order) {
		this.order = order;
	}
	private String message;
    private String status;
    private OrderDTO order;
    public RecipientDTO getRecipient() {
		return recipient;
	}
	public void setRecipient(RecipientDTO recipient) {
		this.recipient = recipient;
	}
	private RecipientDTO recipient;
}
