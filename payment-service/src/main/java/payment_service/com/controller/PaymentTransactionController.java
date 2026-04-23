package payment_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.PaymentTransaction;
import payment_service.com.service.PaymentTransactionService;
import java.util.List;

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
}
