package docker_test.com.dto;

public class OrderShipmentDTO {
           public OrderShipmentDTO(Long order_id, Long shop_id, Double total_amount, String carrier_name, Double shipping_fee,
			String tracking_number, String shipping_status) {
		super();
		this.order_id = order_id;
		this.shop_id = shop_id;
		this.carrier_name = carrier_name;
		this.shipping_fee = shipping_fee;
		this.total_amount = total_amount;
		this.tracking_number = tracking_number;
		this.shipping_status = shipping_status;
	}
		   public Long getOrder_id() {
		return order_id;
	}
	public void setOrder_id(Long order_id) {
		this.order_id = order_id;
	}
	public Long getShop_id() {
		return shop_id;
	}
	public void setShop_id(Long shop_id) {
		this.shop_id = shop_id;
	}
	public String getCarrier_name() {
		return carrier_name;
	}
	public void setCarrier_name(String carrier_name) {
		this.carrier_name = carrier_name;
	}
	public Double getShipping_fee() {
		return shipping_fee;
	}
	public void setShipping_fee(Double shipping_fee) {
		this.shipping_fee = shipping_fee;
	}
	public String getTracking_number() {
		return tracking_number;
	}
	public void setTracking_number(String tracking_number) {
		this.tracking_number = tracking_number;
	}
	public String getShipping_status() {
		return shipping_status;
	}
	public void setShipping_status(String shipping_status) {
		this.shipping_status = shipping_status;
	}
		   private Long order_id;
           private Long shop_id;
           private String carrier_name;
           private Double shipping_fee;
           public Double getTotal_amount() {
			return total_amount;
		}
		   public void setTotal_amount(Double total_amount) {
			   this.total_amount = total_amount;
		   }
		   private Double total_amount;																			
           private String tracking_number;
           private String shipping_status;
           
           @Override
           public String toString() {
			   return "OrderShipmentDTO{" +
					   "order_id=" + order_id +
					   ", shop_id=" + shop_id +
					   ", carrier_name='" + carrier_name + '\'' +
					   ", shipping_fee=" + shipping_fee +
					   ", total_amount=" + total_amount +
					   ", tracking_number='" + tracking_number + '\'' +
					   ", shipping_status='" + shipping_status + '\'' +
					   '}';
		   }
           
}
