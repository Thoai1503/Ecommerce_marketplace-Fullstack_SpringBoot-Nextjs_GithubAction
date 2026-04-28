package payment_service.com.dto;

/**
 * Supported payment gateway providers.
 * To add a new provider: add an enum constant here, then implement PaymentGateway.
 */
public enum PaymentProvider {
    VNPAY,
    MOMO,
    ZALOPAY,
    STRIPE
}
