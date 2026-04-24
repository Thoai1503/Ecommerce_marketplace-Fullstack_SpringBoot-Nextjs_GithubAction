package payment_service.com.dto;

import java.util.List;
import payment_service.com.entity.PaymentTransaction;

public record PaymentRevenueReconciliationResponse(
    String txnType,
    long filteredSuccessTransactionCount,
    long filteredSnapshotCount,
    long missingSnapshotCount,
    long invalidSnapshotCount,
    long overallSuccessTransactionCount,
    long overallSnapshotCount,
    long cumulativeCountGap,
    long cumulativeGrossGap,
    long cumulativeDiscountGap,
    long cumulativeFeeGap,
    long cumulativeNetGap,
    PaymentRevenueSnapshotResponse latestSnapshot,
    List<PaymentTransaction> missingTransactions,
    List<PaymentRevenueSnapshotResponse> invalidSnapshots
) {}