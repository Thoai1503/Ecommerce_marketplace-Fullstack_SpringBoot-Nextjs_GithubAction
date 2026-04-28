package payment_service.com.dto;

import java.time.LocalDateTime;

public record PaymentRevenueSummaryResponse(
    String txnType,
    LocalDateTime fromTime,
    LocalDateTime toTime,
    long successCount,
    long grossAmount,
    long discountAmount,
    long feeAmount,
    long netAmount,
    LocalDateTime latestRecognizedAt
) {}