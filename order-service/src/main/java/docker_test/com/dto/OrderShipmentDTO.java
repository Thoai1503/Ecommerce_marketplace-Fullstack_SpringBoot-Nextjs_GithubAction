package docker_test.com.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderShipmentDTO {
           public OrderShipmentDTO() {
		super();
	}
           public OrderShipmentDTO(Long order_id, Long shop_id, Double total_amount, List<Long> voucher_id , String carrier_name, Double shipping_fee,
			String tracking_number,Double subtotal, Double  total_after_voucher, String shipping_status) {
		super();
		this.order_id = order_id;
		this.shop_id = shop_id;
		this.voucher_id = voucher_id;
		this.carrier_name = carrier_name;
		this.shipping_fee = shipping_fee;
		this.total_amount = total_amount;
		this.tracking_number = tracking_number;
		this.subtotal = subtotal;
		this.total_after_voucher = total_after_voucher;
		this.shipping_status = shipping_status;
	}
           
           
           
		   public List<Long> getVoucher_id() {
			return voucher_id;
		}
		   public void setVoucher_id(List<Long> voucher_id) {
			   this.voucher_id = voucher_id;
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
           private List<Long> voucher_id;
           public Double getSubtotal() {
			return subtotal;
		}
		   public void setSubtotal(Double subtotal) {
			   this.subtotal = subtotal;
		   }
		   public Double getTotal_after_voucher() {
			   return total_after_voucher;
		   }
		   public void setTotal_after_voucher(Double total_after_voucher) {
			   this.total_after_voucher = total_after_voucher;
		   }
		   private Double subtotal;
           private Double total_after_voucher;
           
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
					   
					   '}' + "Voucher IDs: " + voucher_id;
		   }
           
}
