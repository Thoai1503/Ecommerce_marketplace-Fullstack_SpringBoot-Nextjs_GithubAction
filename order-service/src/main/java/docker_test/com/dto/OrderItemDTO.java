package docker_test.com.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderItemDTO {

	private Long id;
	private Long order_id;
	private Long shipment_id;
	private String image_url;
	public String getImage_url() {
		return image_url;
	}

	public void setImage_url(String image_url) {
		this.image_url = image_url;
	}

	public Long getShipment_id() {
		return shipment_id;
	}

	public void setShipment_id(Long shipment_id) {
		this.shipment_id = shipment_id;
	}

	private Long shop_id;
	public Long getShop_id() {
		return shop_id;
	}

	public void setShop_id(Long shop_id) {
		this.shop_id = shop_id;
	}

	private Long product_id;
	public String getProduct_name() {
		return product_name;
	}

	public void setProduct_name(String product_name) {
		this.product_name = product_name;
	}

	public String getVariant_name() {
		return variant_name;
	}

	public void setVariant_name(String variant_name) {
		this.variant_name = variant_name;
	}

	private String product_name;
	private String variant_name;
	
	public Long getVariant_id() {
		return variant_id;
	}

	public void setVariant_id(Long variant_id) {
		this.variant_id = variant_id;
	}

	private Long variant_id;
	private Integer quantity;
	private double price;
	private Double shop_voucher_discount_amount;
	private Double platform_voucher_discount_amount;
	private Double total_voucher_discount_amount;
	private Double total_after_shop_voucher;
	private Double total_after_all_vouchers;
	private Double platform_commission_rate;
	private Double platform_commission_amount;
	private Double seller_receivable_amount;

	public OrderItemDTO() {
	}

	public OrderItemDTO(Long id, Long order_id, Long shop_id, Long product_id,Long variant_id, Integer quantity, double price) {
		this.id = id;
		this.order_id = order_id;
		this.shop_id = shop_id;
		this.product_id = product_id;
		this.variant_id = variant_id;
		this.quantity = quantity;
		this.price = price;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getOrder_id() {
		return order_id;
	}

	public void setOrder_id(Long order_id ) {
		this.order_id = order_id ;
	}

	public Long getProduct_id() {
		return product_id;
	}

	public void setProduct_id(Long product_id) {
		this.product_id = product_id;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public Double getShop_voucher_discount_amount() {
		return shop_voucher_discount_amount;
	}

	public void setShop_voucher_discount_amount(Double shop_voucher_discount_amount) {
		this.shop_voucher_discount_amount = shop_voucher_discount_amount;
	}

	public Double getPlatform_voucher_discount_amount() {
		return platform_voucher_discount_amount;
	}

	public void setPlatform_voucher_discount_amount(Double platform_voucher_discount_amount) {
		this.platform_voucher_discount_amount = platform_voucher_discount_amount;
	}

	public Double getTotal_voucher_discount_amount() {
		return total_voucher_discount_amount;
	}

	public void setTotal_voucher_discount_amount(Double total_voucher_discount_amount) {
		this.total_voucher_discount_amount = total_voucher_discount_amount;
	}

	public Double getTotal_after_shop_voucher() {
		return total_after_shop_voucher;
	}

	public void setTotal_after_shop_voucher(Double total_after_shop_voucher) {
		this.total_after_shop_voucher = total_after_shop_voucher;
	}

	public Double getTotal_after_all_vouchers() {
		return total_after_all_vouchers;
	}

	public void setTotal_after_all_vouchers(Double total_after_all_vouchers) {
		this.total_after_all_vouchers = total_after_all_vouchers;
	}

	public Double getPlatform_commission_rate() {
		return platform_commission_rate;
	}

	public void setPlatform_commission_rate(Double platform_commission_rate) {
		this.platform_commission_rate = platform_commission_rate;
	}

	public Double getPlatform_commission_amount() {
		return platform_commission_amount;
	}

	public void setPlatform_commission_amount(Double platform_commission_amount) {
		this.platform_commission_amount = platform_commission_amount;
	}

	public Double getSeller_receivable_amount() {
		return seller_receivable_amount;
	}

	public void setSeller_receivable_amount(Double seller_receivable_amount) {
		this.seller_receivable_amount = seller_receivable_amount;
	}
	
	@Override
	public String toString() {
		return "OrderItemDTO [id=" + id + ", order_id=" + order_id + ", product_id=" + product_id + ", variant_id="
				+ variant_id + ", quantity=" + quantity + ", price=" + price + "]";
	}
}
