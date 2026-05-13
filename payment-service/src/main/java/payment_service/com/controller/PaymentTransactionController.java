package payment_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.PaymentTransaction;
import payment_service.com.entity.PaymentStatusHistory;
import payment_service.com.dto.PaymentStatusHistoryResponse;
import payment_service.com.service.PaymentTransactionService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments/transactions")
@RequiredArgsConstructor
public class PaymentTransactionController {
    
    private final PaymentTransactionService transactionService;
    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<PaymentTransaction> createTransaction(@RequestBody PaymentTransaction transaction) {
        PaymentTransaction created = transactionService.createTransaction(transaction);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/{txnCode}")
    public ResponseEntity<PaymentTransaction> getTransaction(@PathVariable String txnCode) {
        PaymentTransaction transaction = transactionService.getByTxnCode(txnCode);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentTransaction> getByOrderId(@PathVariable Long orderId) {
        PaymentTransaction transaction = transactionService.getByOrderId(orderId);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentTransaction>> getUserTransactions(@PathVariable Long userId) {
        List<PaymentTransaction> transactions = transactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PaymentTransaction>> searchByTypeAndStatus(
            @RequestParam String txnType,
            @RequestParam String status) {
        List<PaymentTransaction> transactions = transactionService.getByTypeAndStatus(txnType, status);
        return ResponseEntity.ok(transactions);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentTransaction> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason,
            @RequestParam String changedBy,
            @RequestParam(required = false) Long actorId) {
        PaymentTransaction transaction = transactionService.updateStatus(id, status, reason, changedBy, actorId);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping("/{transactionId}/history")
    public ResponseEntity<List<PaymentStatusHistoryResponse>> getTransactionHistory(@PathVariable Long transactionId) {
        List<PaymentStatusHistory> history = transactionService.getTransactionHistory(transactionId);
        List<PaymentStatusHistoryResponse> response = history.stream()
                .map(item -> PaymentStatusHistoryResponse.builder()
                        .id(item.getId())
                        .transactionId(item.getTransaction().getId())
                        .fromStatus(item.getFromStatus())
                        .toStatus(item.getToStatus())
                        .changedBy(item.getChangedBy())
                        .actorId(item.getActorId())
                        .reason(item.getReason())
                        .gatewayData(item.getGatewayData())
                        .createdAt(item.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
