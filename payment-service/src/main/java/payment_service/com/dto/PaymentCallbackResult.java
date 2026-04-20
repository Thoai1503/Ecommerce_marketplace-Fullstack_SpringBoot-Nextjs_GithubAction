package payment_service.com.dto;

/**
 * Unified result returned after processing a payment callback.
 */
public class PaymentCallbackResult {

    /** Internal order ID extracted from the callback. */
    private Long orderId;

    /** Transaction reference from the gateway. */
    private String txnRef;

    /** Was the payment successful? */
    private boolean success;

    /** Human-readable status message. */
    private String message;

    /** The gateway that sent this callback. */
    private PaymentProvider provider;

    /** Raw response code from the gateway (e.g. "00" = success for VNPay). */
    private String responseCode;

    private PaymentCallbackResult(Builder builder) {
        this.orderId = builder.orderId;
        this.txnRef = builder.txnRef;
        this.success = builder.success;
        this.message = builder.message;
        this.provider = builder.provider;
        this.responseCode = builder.responseCode;
    }

    public Long getOrderId() { return orderId; }
    public String getTxnRef() { return txnRef; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public PaymentProvider getProvider() { return provider; }
    public String getResponseCode() { return responseCode; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private Long orderId;
        private String txnRef;
        private boolean success;
        private String message;
        private PaymentProvider provider;
        private String responseCode;

        public Builder orderId(Long orderId) { this.orderId = orderId; return this; }
        public Builder txnRef(String txnRef) { this.txnRef = txnRef; return this; }
        public Builder success(boolean success) { this.success = success; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder provider(PaymentProvider provider) { this.provider = provider; return this; }
        public Builder responseCode(String responseCode) { this.responseCode = responseCode; return this; }

        public PaymentCallbackResult build() { return new PaymentCallbackResult(this); }
    }
}
