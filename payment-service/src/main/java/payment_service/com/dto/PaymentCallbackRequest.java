package payment_service.com.dto;

import java.util.Map;

/**
 * Unified callback request from any payment gateway.
 *
 * <p>This DTO adapts the raw callback data (which varies by provider)
 * into a normalized form. The controller extracts the paymentProvider
 * to route to the correct handler.
 */
public class PaymentCallbackRequest {

    /** The payment provider that initiated this callback. */
    private PaymentProvider paymentProvider;

    /** All raw query parameters from the callback URL. */
    private Map<String, String> params;

    /** IP address of the callback source (for logging/auditing). */
    private String sourceIpAddress;

    public PaymentCallbackRequest() {}

    public PaymentCallbackRequest(PaymentProvider paymentProvider, Map<String, String> params, String sourceIpAddress) {
        this.paymentProvider = paymentProvider;
        this.params = params;
        this.sourceIpAddress = sourceIpAddress;
    }

    public PaymentProvider getPaymentProvider() { return paymentProvider; }
    public void setPaymentProvider(PaymentProvider paymentProvider) { this.paymentProvider = paymentProvider; }

    public Map<String, String> getParams() { return params; }
    public void setParams(Map<String, String> params) { this.params = params; }

    public String getSourceIpAddress() { return sourceIpAddress; }
    public void setSourceIpAddress(String sourceIpAddress) { this.sourceIpAddress = sourceIpAddress; }
}
