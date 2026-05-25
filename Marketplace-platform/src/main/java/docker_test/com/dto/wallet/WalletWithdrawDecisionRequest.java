package docker_test.com.dto.wallet;

public class WalletWithdrawDecisionRequest {

    private String requestTransactionNo;
    private Long approvedBy;
    private String note;

    public String getRequestTransactionNo() {
        return requestTransactionNo;
    }

    public void setRequestTransactionNo(String requestTransactionNo) {
        this.requestTransactionNo = requestTransactionNo;
    }

    public Long getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
