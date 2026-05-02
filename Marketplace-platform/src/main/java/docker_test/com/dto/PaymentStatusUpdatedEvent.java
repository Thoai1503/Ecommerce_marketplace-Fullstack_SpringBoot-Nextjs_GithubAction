package docker_test.com.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class PaymentStatusUpdatedEvent {

    @JsonProperty("orderId")
    @JsonAlias({"order_id"})
    private Long orderId;

    @JsonProperty("txnRef")
    @JsonAlias({"txn_ref"})
    private String txnRef;

    private Boolean success;

    private String message;

    private String provider;

    @JsonProperty("responseCode")
    @JsonAlias({"response_code"})
    private String responseCode;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public void setTxnRef(String txnRef) {
        this.txnRef = txnRef;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(String responseCode) {
        this.responseCode = responseCode;
    }
}