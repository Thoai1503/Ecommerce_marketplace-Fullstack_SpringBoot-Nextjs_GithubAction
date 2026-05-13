package docker_test.com.repository;

public interface OrderShipmentWithOrderAndRecipientProjection {
    Long getShipmentId();
    Long getOrderId();
    Long getShopId();
    String getShopName();
    
    String getCarrierName();
    String getTrackingNumber();
    String getShippingStatus();

    String getOrderNumber();
    Long getUserId();
    Long getAddressId();
    Double getTotalAmount();
    Long getShippingFee();
    Long getDiscountAmount();
    Long getFinalAmount();
    String getPaymentMethod();
    String getPaymentStatus();
    String getOrderStatus();

    String getRecipientName();
    String getRecipientPhone();
    String getAddressLine();
    String getWard();
    String getDistrict();
    String getCity();
    String getPostalCode();
}
