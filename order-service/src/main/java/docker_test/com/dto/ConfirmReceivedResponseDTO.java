package docker_test.com.dto;

public class ConfirmReceivedResponseDTO {

    private Long shipmentId;
    private Long orderId;
    private String previousShippingStatus;
    private String shippingStatus;
    private String message;

    public ConfirmReceivedResponseDTO(
            Long shipmentId,
            Long orderId,
            String previousShippingStatus,
            String shippingStatus,
            String message
    ) {
        this.shipmentId = shipmentId;
        this.orderId = orderId;
        this.previousShippingStatus = previousShippingStatus;
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

    public String getPreviousShippingStatus() {
        return previousShippingStatus;
    }

    public void setPreviousShippingStatus(String previousShippingStatus) {
        this.previousShippingStatus = previousShippingStatus;
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
