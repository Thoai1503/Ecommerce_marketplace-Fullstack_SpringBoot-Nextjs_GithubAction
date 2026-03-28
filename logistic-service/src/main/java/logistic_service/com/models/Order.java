package logistic_service.com.models;

import java.util.List;

import logistic_service.com.models.OrderItem;

public class Order {
  public String getOrder_number() {
		return order_number;
	}

	public void setOrder_number(String order_number) {
		this.order_number = order_number;
	}

  private String order_number;
  
	private Long id;
	public String getName() {
		return name;
	}
	private Long user_id;

	public void setName(String name) {
		this.name = name;
	}

	private String name;


	public Long getAddress_id() {
		return address_id;
	}

	public void setAddress_id(Long address_id) {
		this.address_id = address_id;
	}

	public Long getShipping_fee() {
		return shipping_fee;
	}

	public void setShipping_fee(Long shipping_fee) {
		this.shipping_fee = shipping_fee;
	}

	public Long getDiscount_amount() {
		return discount_amount;
	}

	public void setDiscount_amount(Long discount_amount) {
		this.discount_amount = discount_amount;
	}

	public String getPayment_method() {
		return payment_method;
	}

	public void setPayment_method(String payment_method) {
		this.payment_method = payment_method;
	}

	public Long getFinal_amount() {
		return final_amount;
	}

	public void setFinal_amount(Long final_amount) {
		this.final_amount = final_amount;
	}

	public String getOrder_status() {
		return order_status;
	}

	public void setOrder_status(String order_status) {
		this.order_status = order_status;
	}

	public String getTracking_number() {
		return tracking_number;
	}

	public void setTracking_number(String tracking_number) {
		this.tracking_number = tracking_number;
	}

	public String getCancel_reason() {
		return cancel_reason;
	}

	public void setCancel_reason(String cancel_reason) {
		this.cancel_reason = cancel_reason;
	}

	public Order(Long id, String name, Long user_id, Long address_id, String order_number , Long shipping_fee, Long discount_amount,
			String payment_method, Long final_amount, String order_status, String tracking_number,
			double total_price) {
		super();
		this.id = id;
		this.name = name;
		this.user_id = user_id;
		this.order_number = order_number;
		this.address_id = address_id;
		this.shipping_fee = shipping_fee;
		this.discount_amount = discount_amount;
		this.payment_method = payment_method;
		this.final_amount = final_amount;
		this.order_status = order_status;
		this.tracking_number = tracking_number;
	
		this.total_price = total_price;
	
	}

	private Long address_id;
	private Long shipping_fee;
	private Long discount_amount;
	private String payment_method;
	private Long final_amount;
	private String order_status;
	private String tracking_number;
	private String cancel_reason;

	public double getTotal_price() {
		return total_price;
	}

	public void setTotal_price(double total_price) {
		this.total_price = total_price;
	}

	private double total_price;
    public List<OrderItem> getOrders_items() {
		return orders_items;
	}

	public void setOrders_items(List<OrderItem> orders_items) {
		this.orders_items = orders_items;
	}

	private List<OrderItem> orders_items;
	
	public Order() {
	}



	public Long getId() {	
		return id;
	}
	
	

	public void setId(Long id) {
		this.id = id;
	}



    public Recipient getRecipient() {
		return recipient;
	}
	public void setRecipient(Recipient recipient) {
		this.recipient = recipient;
	}
	private Recipient recipient;

	public Long getUser_id() {
		return user_id;
	}

	public void setUser_id(Long user_id) {
		this.user_id = user_id;
	}

	

	
   @Override
   public String toString() {
	   return String.format("Order => id: %s, user_id: %s, order_number: %s, address_id: %s, shipping_fee: %s, discount_amount: %s, payment_method: %s, final_amount: %s, order_status: %s, tracking_number: %s, cancel_reason: %s, total_price: %s, orders_items: %s", 
			   id,user_id,order_number,address_id,shipping_fee,discount_amount,payment_method,final_amount,order_status,tracking_number,cancel_reason,total_price,orders_items);
   }
	
}
