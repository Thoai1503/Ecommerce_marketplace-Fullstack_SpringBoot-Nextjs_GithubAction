package docker_test.com.models.wallet;

public enum WalletTransactionType {
    SHOP_PAYOUT,
    BUYER_REFUND,
    WITHDRAW_REQUEST,
    WITHDRAW_SUCCESS,
    WITHDRAW_REJECT,
    MANUAL_ADJUSTMENT,
    REVERSAL,
    FEE
}
