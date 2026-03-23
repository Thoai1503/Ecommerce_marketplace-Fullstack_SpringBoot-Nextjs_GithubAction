package docker_test.com.dto;

public class OrderInfo {

	
	private int id;

	private int user_id;
	private int quantity;
	private double price;

	public OrderInfo() {
	}

	public OrderInfo(int id,int shop_id,int user_id, String productName, int quantity, double price) {
		this.id = id;
		
		this.user_id = user_id;
		
	
		this.quantity = quantity;
		this.price = price;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	

	public int getUser_id() {
		return user_id;
	}

	public void setUser_id(int user_id) {
		this.user_id = user_id;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}
}
