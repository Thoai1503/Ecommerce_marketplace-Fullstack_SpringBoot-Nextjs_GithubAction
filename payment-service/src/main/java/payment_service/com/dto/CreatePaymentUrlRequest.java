package payment_service.com.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Unified request payload for creating a payment URL.
 * Contains all information needed regardless of which gateway will process it.
 * Provider-specific fields that are not modelled here can be passed via extraData.
 */
public class CreatePaymentUrlRequest {

    /** Internal order ID. */
    @NotNull
    private Long orderId;

    /** Amount in base currency unit (e.g. VND). Must be >= 1. */
    @NotNull
    @Min(1)
    private Long amount;

    /** Human-readable description shown on the payment page. */
    @NotBlank
    private String orderInfo;

    /** Which payment gateway to route this request to. */
    @NotNull
    private PaymentProvider paymentProvider;

    /** Merchant-defined order type (default "other"). */
    private String orderType = "other";

    /** Preferred bank code; only relevant for gateways that support bank selection. */
    private String bankCode;

    /** Language code for the payment page (default "vn"). */
    private String language = "vn";

    /** Client IP address; if null the gateway will fall back to the HTTP request IP. */
    private String ipAddress;

    /**
     * Override the default return URL configured in gateway properties.
     * Leave null to use the configured default.
     */
    private String returnUrl;

    /**
     * Free-form map for provider-specific parameters that are not modelled above.
     * Example: MoMo requires "requestType", ZaloPay requires "app_user".
     */
    private Map<String, String> extraData;

    // ── Getters / Setters ──────────────────────────────────────────────────────

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getOrderInfo() { return orderInfo; }
    public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }

    public PaymentProvider getPaymentProvider() { return paymentProvider; }
    public void setPaymentProvider(PaymentProvider paymentProvider) { this.paymentProvider = paymentProvider; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }

    public Map<String, String> getExtraData() { return extraData; }
    public void setExtraData(Map<String, String> extraData) { this.extraData = extraData; }
}
