package logistic_service.com.enums;

public enum ShipmentDirection {
     FORWARD("Giao hàng đi"),
     RETURN("Trả hàng về");
	private final String description;
	
	ShipmentDirection(String description) {
		this.description = description;
	}
	
	public String getDescription() {
		return description;
	}
}
