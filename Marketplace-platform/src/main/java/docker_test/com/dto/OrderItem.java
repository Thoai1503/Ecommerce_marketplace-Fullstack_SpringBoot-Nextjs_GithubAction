package docker_test.com.dto;

public class OrderItem {

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

	public OrderItem() {
	}

	public OrderItem(Long id, Long order_id, Long shop_id, Long product_id,Long variant_id, Integer quantity, double price) {
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
	
	@Override
	public String toString() {
		return "OrderItemDTO [id=" + id + ", order_id=" + order_id + ", product_id=" + product_id + ", variant_id="
				+ variant_id + ", quantity=" + quantity + ", price=" + price + "]";
	}
}
