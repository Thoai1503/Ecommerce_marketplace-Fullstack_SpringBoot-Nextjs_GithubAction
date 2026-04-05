package logistic_service.com.enums;

/**
 * Trạng thái vận đơn (Shipment Status).
 * 
 * Vòng đời của vận đơn:
 * PENDING -> CONFIRMED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
 *
 * Trường hợp bất thường:
 * Bất kỳ trạng thái nào -> FAILED
 * Bất kỳ trạng thái nào -> RETURNED
 */
public enum ShipmentStatus {
    /**
     * Đang chờ xử lý - Vận đơn vừa được tạo, chờ xác nhận từ hệ thống logistic.
     */
    PENDING("Đang chờ xử lý"),

    /**
     * Đơn hàng đã xác nhận - Shop đã xác nhận gói hàng, logistics đã nhận thông tin.
     */
    CONFIRMED("Đơn hàng đã xác nhận"),

    /**
     * Đã nhận hàng - Gói hàng đã được lấy đi từ warehouse/store của shop.
     */
    PICKED_UP("Đã lấy hàng"),

    /**
     * Đang vận chuyển trung tuyến - Gói hàng đang trên đường đến điểm giao cuối cùng.
     */
    IN_TRANSIT("Đang vận chuyển"),

    /**
     * Đang giao hàng - Gói hàng đã đến điểm giao cuối cùng, sẽ giao tận nơi sớm.
     */
    OUT_FOR_DELIVERY("Đang giao hàng"),
    /**
     * Đã giao hàng - Khách hàng đã nhận gói hàng thành công.
     */
    DELIVERED("Đã giao hàng"),

    /**
     * Thất bại - Giao hàng thất bại, không giao được cho khách hàng.
     */
    FAILED("Giao hàng thất bại"),

    /**
     * Đã trả lại - Gói hàng được trả lại cho shop/sender.
     */
    RETURNED("Đã trả lại");

    private final String description;

    ShipmentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Kiểm tra xem trạng thái này có phải là trạng thái cuối cùng (terminal state) hay không.
     * Terminal states không thể chuyển sang trạng thái khác (trừ một số exception).
     */
    public boolean isTerminalState() {
        return this == DELIVERED || this == FAILED || this == RETURNED;
    }


    /**
     * Kiểm tra xem trạng thái này có phải là trạng thái thành công hay không.
     */
    public boolean isSuccessful() {
        return this == DELIVERED;
    }

    /**
     * Kiểm tra xem trạng thái này có phải là trạng thái lỗi hay không.
     */
    public boolean isFailed() {
        return this == FAILED || this == RETURNED;
    }
}
