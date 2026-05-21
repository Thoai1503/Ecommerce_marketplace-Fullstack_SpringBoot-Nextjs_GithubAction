package docker_test.com.models;

public enum ReturnShipmentStatus {
    PENDING("Đang chờ xử lý"),
    CONFIRMED("Đã xác nhận"),
    PICKED_UP("Đã lấy hàng"),
    IN_TRANSIT("Đang trung chuyển"),
    OUT_FOR_DELIVERY("Đang giao hàng"),
    DELIVERED("Đã giao hàng"),
    FAILED("Giao hàng thất bại");
    
    private final String description;
    
	ReturnShipmentStatus(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}

}
