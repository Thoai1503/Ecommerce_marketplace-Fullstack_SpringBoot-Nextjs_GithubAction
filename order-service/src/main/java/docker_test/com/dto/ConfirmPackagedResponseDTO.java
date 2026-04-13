package docker_test.com.dto;

public class ConfirmPackagedResponseDTO {

    private Long shipmentId;
    private Long orderId;
    private String trackingCode;
    private String shippingStatus;
    private String message;

    public ConfirmPackagedResponseDTO(Long shipmentId, Long orderId, String trackingCode, String shippingStatus, String message) {
        this.shipmentId = shipmentId;
        this.orderId = orderId;
        this.trackingCode = trackingCode;
        this.shippingStatus = shippingStatus;
        this.message = message;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getTrackingCode() {
        return trackingCode;
    }

    public void setTrackingCode(String trackingCode) {
        this.trackingCode = trackingCode;
    }

    public String getShippingStatus() {
        return shippingStatus;
    }

    public void setShippingStatus(String shippingStatus) {
        this.shippingStatus = shippingStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}