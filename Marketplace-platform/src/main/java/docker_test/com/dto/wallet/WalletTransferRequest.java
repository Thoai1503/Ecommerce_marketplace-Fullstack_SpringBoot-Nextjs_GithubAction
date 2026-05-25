package docker_test.com.dto.wallet;

import java.math.BigDecimal;

import docker_test.com.models.wallet.WalletSourceType;
import docker_test.com.models.wallet.WalletTransactionType;

public class WalletTransferRequest {

    private Long fromWalletId;
    private Long toWalletId;
    private BigDecimal amount;
    private BigDecimal feeAmount;
    private WalletTransactionType transactionType;
    private WalletSourceType sourceType;
    private Long sourceId;
    private String idempotencyKey;
    private String note;
    private String metadata;
    private Long createdBy;

    public Long getFromWalletId() {
        return fromWalletId;
    }

    public void setFromWalletId(Long fromWalletId) {
        this.fromWalletId = fromWalletId;
    }

    public Long getToWalletId() {
        return toWalletId;
    }

    public void setToWalletId(Long toWalletId) {
        this.toWalletId = toWalletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getFeeAmount() {
        return feeAmount;
    }

    public void setFeeAmount(BigDecimal feeAmount) {
        this.feeAmount = feeAmount;
    }

    public WalletTransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(WalletTransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public WalletSourceType getSourceType() {
        return sourceType;
    }

    public void setSourceType(WalletSourceType sourceType) {
        this.sourceType = sourceType;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}
