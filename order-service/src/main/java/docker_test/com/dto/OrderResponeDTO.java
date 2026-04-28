package docker_test.com.dto;

public class OrderResponeDTO {
    public OrderResponeDTO(Integer id, String paymentUrl, String message) {
		super();
		this.id = id;
		this.paymentUrl = paymentUrl;
		this.message = message;
	}
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getPaymentUrl() {
		return paymentUrl;
	}
	public void setPaymentUrl(String paymentUrl) {
		this.paymentUrl = paymentUrl;
	}
	private Integer id;
    private String paymentUrl;
    public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	private String message;
    
	public OrderResponeDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
		return "OrderResponeDTO [id=" + id + ", paymentUrl=" + paymentUrl + ", message=" + message + "]";
	}
}
