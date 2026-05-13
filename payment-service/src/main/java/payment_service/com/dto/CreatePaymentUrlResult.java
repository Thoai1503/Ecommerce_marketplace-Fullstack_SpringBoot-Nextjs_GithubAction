package payment_service.com.dto;

/**
 * Unified result returned by any PaymentGateway after creating a payment URL.
 */
public class CreatePaymentUrlResult {

    /** Redirect URL the client must open to complete payment. */
    private final String paymentUrl;

    /** Gateway-specific transaction reference (e.g. VNPay vnp_TxnRef). */
    private final String txnRef;

    /** Timestamp the payment session was created (yyyyMMddHHmmss). */
    private final String createDate;

    /** Timestamp the payment session expires (yyyyMMddHHmmss). */
    private final String expireDate;

    /** Which gateway produced this result. */
    private final PaymentProvider provider;

    private CreatePaymentUrlResult(Builder builder) {
        this.paymentUrl  = builder.paymentUrl;
        this.txnRef      = builder.txnRef;
        this.createDate  = builder.createDate;
        this.expireDate  = builder.expireDate;
        this.provider    = builder.provider;
    }

    public String getPaymentUrl()  { return paymentUrl; }
    public String getTxnRef()      { return txnRef; }
    public String getCreateDate()  { return createDate; }
    public String getExpireDate()  { return expireDate; }
    public PaymentProvider getProvider() { return provider; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private String paymentUrl;
        private String txnRef;
        private String createDate;
        private String expireDate;
        private PaymentProvider provider;

        public Builder paymentUrl(String paymentUrl)   { this.paymentUrl  = paymentUrl;  return this; }
        public Builder txnRef(String txnRef)           { this.txnRef      = txnRef;      return this; }
        public Builder createDate(String createDate)   { this.createDate  = createDate;  return this; }
        public Builder expireDate(String expireDate)   { this.expireDate  = expireDate;  return this; }
        public Builder provider(PaymentProvider provider) { this.provider = provider;    return this; }

        public CreatePaymentUrlResult build() { return new CreatePaymentUrlResult(this); }
    }
}
