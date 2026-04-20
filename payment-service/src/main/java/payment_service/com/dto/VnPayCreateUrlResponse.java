package payment_service.com.dto;

public record VnPayCreateUrlResponse(
    String paymentUrl,
    String txnRef,
    String createDate,
    String expireDate
) {
}
