package payment_service.com.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import payment_service.com.dto.PaymentRevenueReconciliationResponse;
import payment_service.com.dto.PaymentRevenueSnapshotResponse;
import payment_service.com.dto.PaymentRevenueSummaryResponse;
import payment_service.com.entity.PaymentRevenueSnapshot;
import payment_service.com.entity.PaymentTransaction;
import payment_service.com.repository.PaymentRevenueSnapshotRepository;
import payment_service.com.repository.PaymentTransactionRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentRevenueSnapshotService {

    private final PaymentRevenueSnapshotRepository snapshotRepository;
    private final PaymentTransactionRepository transactionRepository;

    public List<PaymentRevenueSnapshotResponse> getSnapshots(
        String txnType,
        LocalDateTime fromTime,
        LocalDateTime toTime
    ) {
        List<PaymentRevenueSnapshot> snapshots = snapshotRepository.search(normalize(txnType), fromTime, toTime);
        return enrichSnapshots(snapshots);
    }

    public PaymentRevenueSummaryResponse getSummary(
        String txnType,
        LocalDateTime fromTime,
        LocalDateTime toTime
    ) {
        List<PaymentRevenueSnapshot> snapshots = snapshotRepository.search(normalize(txnType), fromTime, toTime);
        long grossAmount = snapshots.stream().mapToLong(snapshot -> safe(snapshot.getGrossAmount())).sum();
        long discountAmount = snapshots.stream().mapToLong(snapshot -> safe(snapshot.getDiscountAmount())).sum();
        long feeAmount = snapshots.stream().mapToLong(snapshot -> safe(snapshot.getFeeAmount())).sum();
        long netAmount = snapshots.stream().mapToLong(snapshot -> safe(snapshot.getNetAmount())).sum();
        LocalDateTime latestRecognizedAt = snapshots.isEmpty() ? null : snapshots.get(0).getRecognizedAt();

        return new PaymentRevenueSummaryResponse(
            normalize(txnType),
            fromTime,
            toTime,
            snapshots.size(),
            grossAmount,
            discountAmount,
            feeAmount,
            netAmount,
            latestRecognizedAt
        );
    }

    public PaymentRevenueReconciliationResponse getReconciliation(
        String txnType,
        LocalDateTime fromTime,
        LocalDateTime toTime
    ) {
        String normalizedTxnType = normalize(txnType);
        List<PaymentRevenueSnapshot> filteredSnapshots = snapshotRepository.search(normalizedTxnType, fromTime, toTime);
        List<PaymentTransaction> filteredSuccessTransactions = transactionRepository.findSuccessfulTransactions(
            normalizedTxnType,
            fromTime,
            toTime
        );

        Set<Long> filteredSnapshotTransactionIds = filteredSnapshots.stream()
            .map(PaymentRevenueSnapshot::getTransactionId)
            .collect(Collectors.toSet());

        List<PaymentTransaction> missingTransactions = filteredSuccessTransactions.stream()
            .filter(transaction -> !filteredSnapshotTransactionIds.contains(transaction.getId()))
            .toList();

        Map<Long, PaymentTransaction> filteredTransactionMap = buildTransactionMap(filteredSnapshots);
        List<PaymentRevenueSnapshotResponse> invalidSnapshots = filteredSnapshots.stream()
            .filter(snapshot -> {
                PaymentTransaction transaction = filteredTransactionMap.get(snapshot.getTransactionId());
                return transaction == null || !"SUCCESS".equalsIgnoreCase(transaction.getStatus());
            })
            .map(snapshot -> toResponse(snapshot, filteredTransactionMap.get(snapshot.getTransactionId())))
            .toList();

        List<PaymentTransaction> overallSuccessTransactions = transactionRepository.findSuccessfulTransactions(null, null, null);
        List<PaymentRevenueSnapshot> overallSnapshots = snapshotRepository.findAll();
        PaymentRevenueSnapshot latestSnapshot = snapshotRepository.findTopByOrderByRecognizedAtDescIdDesc().orElse(null);

        long overallSnapshotCount = overallSnapshots.size();
        long overallSuccessTransactionCount = overallSuccessTransactions.size();
        long overallGross = overallSnapshots.stream().mapToLong(snapshot -> safe(snapshot.getGrossAmount())).sum();
        long overallDiscount = overallSnapshots.stream().mapToLong(snapshot -> safe(snapshot.getDiscountAmount())).sum();
        long overallFee = overallSnapshots.stream().mapToLong(snapshot -> safe(snapshot.getFeeAmount())).sum();
        long overallNet = overallSnapshots.stream().mapToLong(snapshot -> safe(snapshot.getNetAmount())).sum();

        return new PaymentRevenueReconciliationResponse(
            normalizedTxnType,
            filteredSuccessTransactions.size(),
            filteredSnapshots.size(),
            missingTransactions.size(),
            invalidSnapshots.size(),
            overallSuccessTransactionCount,
            overallSnapshotCount,
            latestSnapshot == null ? 0L : safe(latestSnapshot.getCumulativeSuccessCount()) - overallSnapshotCount,
            latestSnapshot == null ? 0L : safe(latestSnapshot.getCumulativeGrossAmount()) - overallGross,
            latestSnapshot == null ? 0L : safe(latestSnapshot.getCumulativeDiscountAmount()) - overallDiscount,
            latestSnapshot == null ? 0L : safe(latestSnapshot.getCumulativeFeeAmount()) - overallFee,
            latestSnapshot == null ? 0L : safe(latestSnapshot.getCumulativeNetAmount()) - overallNet,
            latestSnapshot == null
                ? null
                : toResponse(latestSnapshot, buildTransactionMap(Collections.singletonList(latestSnapshot)).get(latestSnapshot.getTransactionId())),
            missingTransactions,
            invalidSnapshots
        );
    }

    private List<PaymentRevenueSnapshotResponse> enrichSnapshots(List<PaymentRevenueSnapshot> snapshots) {
        Map<Long, PaymentTransaction> transactionMap = buildTransactionMap(snapshots);
        return snapshots.stream()
            .map(snapshot -> toResponse(snapshot, transactionMap.get(snapshot.getTransactionId())))
            .toList();
    }

    private Map<Long, PaymentTransaction> buildTransactionMap(List<PaymentRevenueSnapshot> snapshots) {
        List<Long> transactionIds = snapshots.stream()
            .map(PaymentRevenueSnapshot::getTransactionId)
            .distinct()
            .toList();

        if (transactionIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return transactionRepository.findAllById(transactionIds).stream()
            .collect(Collectors.toMap(PaymentTransaction::getId, Function.identity(), (left, right) -> left, LinkedHashMap::new));
    }

    private PaymentRevenueSnapshotResponse toResponse(
        PaymentRevenueSnapshot snapshot,
        PaymentTransaction transaction
    ) {
        return new PaymentRevenueSnapshotResponse(
            snapshot.getId(),
            snapshot.getTransactionId(),
            snapshot.getTxnCode(),
            snapshot.getTxnType(),
            snapshot.getCurrency(),
            snapshot.getRecognizedAt(),
            snapshot.getGrossAmount(),
            snapshot.getDiscountAmount(),
            snapshot.getFeeAmount(),
            snapshot.getNetAmount(),
            snapshot.getCumulativeSuccessCount(),
            snapshot.getCumulativeGrossAmount(),
            snapshot.getCumulativeDiscountAmount(),
            snapshot.getCumulativeFeeAmount(),
            snapshot.getCumulativeNetAmount(),
            snapshot.getCreatedAt(),
            transaction == null ? null : transaction.getOrderId(),
            transaction == null ? null : transaction.getOrderNumber(),
            transaction == null ? null : transaction.getPaymentMethod(),
            transaction == null ? null : transaction.getStatus()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private long safe(Long value) {
        return value == null ? 0L : value;
    }
}