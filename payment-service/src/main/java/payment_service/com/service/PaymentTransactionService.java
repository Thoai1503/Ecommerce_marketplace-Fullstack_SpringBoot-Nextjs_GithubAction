package payment_service.com.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.*;
import payment_service.com.repository.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentTransactionService {
    
    private final PaymentTransactionRepository transactionRepository;
    private final PaymentStatusHistoryRepository statusHistoryRepository;
    private final PaymentGatewayLogRepository gatewayLogRepository;
    
    public PaymentTransaction createTransaction(PaymentTransaction transaction) {
        return transactionRepository.save(transaction);
    }
    
    public PaymentTransaction getByTxnCode(String txnCode) {
        return transactionRepository.findByTxnCode(txnCode)
            .orElseThrow(() -> new RuntimeException("Transaction not found: " + txnCode));
    }
    
    public PaymentTransaction getByOrderId(Long orderId) {
        return transactionRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Transaction not found for order: " + orderId));
    }

    public Optional<PaymentTransaction> findOptionalByTxnCode(String txnCode) {
        return transactionRepository.findByTxnCode(txnCode);
    }

    public Optional<PaymentTransaction> findOptionalByOrderId(Long orderId) {
        return transactionRepository.findByOrderId(orderId);
    }
    
    public List<PaymentTransaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<PaymentTransaction> getByTypeAndStatus(String txnType, String status) {
        return transactionRepository.findByTxnTypeAndStatusOrderByCreatedAtDesc(txnType, status);
    }
    
    public PaymentTransaction updateStatus(Long transactionId, String newStatus, String reason, String changedBy, Long actorId) {
        PaymentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        String oldStatus = transaction.getStatus();
        transaction.setStatus(newStatus);
        transaction.setUpdatedAt(LocalDateTime.now());
        
        PaymentTransaction saved = transactionRepository.save(transaction);
        
        // Create status history
        PaymentStatusHistory history = PaymentStatusHistory.builder()
            .transaction(transaction)
            .fromStatus(oldStatus)
            .toStatus(newStatus)
            .reason(reason)
            .changedBy(changedBy)
            .actorId(actorId)
            .build();
        
        statusHistoryRepository.save(history);
        
        return saved;
    }
    
    public List<PaymentStatusHistory> getTransactionHistory(Long transactionId) {
        return statusHistoryRepository.findByTransactionIdOrderByCreatedAtDesc(transactionId);
    }
    
    public void logGatewayCall(PaymentGatewayLog log) {
        gatewayLogRepository.save(log);
    }
}
