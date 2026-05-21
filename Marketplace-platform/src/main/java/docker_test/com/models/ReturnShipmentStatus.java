package docker_test.com.models;

public enum ReturnShipmentStatus {
    PENDING("Đang chờ xử lý"),
    CONFIRMED("Đã xác nhận"),
    PICKED_UP("Đã lấy hàng"),
    SHIPPING("Đang vận chuyển"),
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
