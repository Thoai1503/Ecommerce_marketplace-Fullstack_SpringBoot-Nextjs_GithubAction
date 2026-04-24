package payment_service.com.controller;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import payment_service.com.dto.PaymentRevenueReconciliationResponse;
import payment_service.com.dto.PaymentRevenueSnapshotResponse;
import payment_service.com.dto.PaymentRevenueSummaryResponse;
import payment_service.com.service.PaymentRevenueSnapshotService;

@RestController
@RequestMapping("/api/payments/revenue-snapshots")
@RequiredArgsConstructor
public class PaymentRevenueSnapshotController {

    private final PaymentRevenueSnapshotService paymentRevenueSnapshotService;

    @GetMapping
    public ResponseEntity<List<PaymentRevenueSnapshotResponse>> getSnapshots(
        @RequestParam(required = false) String txnType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toTime
    ) {
        return ResponseEntity.ok(paymentRevenueSnapshotService.getSnapshots(txnType, fromTime, toTime));
    }

    @GetMapping("/summary")
    public ResponseEntity<PaymentRevenueSummaryResponse> getSummary(
        @RequestParam(required = false) String txnType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toTime
    ) {
        return ResponseEntity.ok(paymentRevenueSnapshotService.getSummary(txnType, fromTime, toTime));
    }

    @GetMapping("/reconciliation")
    public ResponseEntity<PaymentRevenueReconciliationResponse> getReconciliation(
        @RequestParam(required = false) String txnType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toTime
    ) {
        return ResponseEntity.ok(paymentRevenueSnapshotService.getReconciliation(txnType, fromTime, toTime));
    }
}