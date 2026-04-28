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
public class RefundService {
    
    private final RefundRequestRepository refundRepository;
    private final RefundStatusHistoryRepository statusHistoryRepository;
    
    public RefundRequest createRefund(RefundRequest refund) {
        return refundRepository.save(refund);
    }
    
    public RefundRequest getByRefundCode(String refundCode) {
        return refundRepository.findByRefundCode(refundCode)
            .orElseThrow(() -> new RuntimeException("Refund not found: " + refundCode));
    }
    
    public List<RefundRequest> getUserRefunds(Long userId) {
        return refundRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<RefundRequest> getByStatus(String status) {
        return refundRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public RefundRequest updateRefundStatus(Long refundId, String newStatus, String reason, String changedBy, Long actorId) {
        RefundRequest refund = refundRepository.findById(refundId)
            .orElseThrow(() -> new RuntimeException("Refund not found"));
        
        String oldStatus = refund.getStatus();
        refund.setStatus(newStatus);
        refund.setUpdatedAt(LocalDateTime.now());
        
        RefundRequest saved = refundRepository.save(refund);
        
        // Create status history
        RefundStatusHistory history = RefundStatusHistory.builder()
            .refund(refund)
            .fromStatus(oldStatus)
            .toStatus(newStatus)
            .note(reason)
            .changedBy(changedBy)
            .actorId(actorId)
            .build();
        
        statusHistoryRepository.save(history);
        
        return saved;
    }
    
    public List<RefundStatusHistory> getRefundHistory(Long refundId) {
        return statusHistoryRepository.findByRefundIdOrderByCreatedAtDesc(refundId);
    }
}
