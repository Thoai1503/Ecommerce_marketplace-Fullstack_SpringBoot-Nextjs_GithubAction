package payment_service.com.dto;

import java.time.LocalDateTime;

public record PaymentRevenueSnapshotResponse(
    Long id,
    Long transactionId,
    String txnCode,
    String txnType,
    String currency,
    LocalDateTime recognizedAt,
    Long grossAmount,
    Long discountAmount,
    Long feeAmount,
    Long netAmount,
    Long cumulativeSuccessCount,
    Long cumulativeGrossAmount,
    Long cumulativeDiscountAmount,
    Long cumulativeFeeAmount,
    Long cumulativeNetAmount,
    LocalDateTime createdAt,
    Long orderId,
    String orderNumber,
    String paymentMethod,
    String transactionStatus
) {}