package docker_test.com.repository;

import java.time.LocalDateTime;

public interface AdminOrderListProjection {
    Long getId();

    Long getOrderId();

    String getOrderNumber();

    Long getUserId();

    Long getAddressId();

    Double getTotalAmount();

    Long getShippingFee();

    Long getDiscountAmount();

    Long getFinalAmount();

    String getPaymentStatus();

    String getPaymentMethod();

    String getOrderStatus();

    String getTrackingNumber();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

    String getCustomerName();

    String getCustomerEmail();

    String getCustomerPhone();

    Integer getItemsCount();

    Integer getShipmentsCount();
}
