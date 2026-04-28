package payment_service.com.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.*;
import payment_service.com.repository.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentDisputeService {
    
    private final PaymentDisputeRepository disputeRepository;
    
    public PaymentDispute createDispute(PaymentDispute dispute) {
        return disputeRepository.save(dispute);
    }
    
    public PaymentDispute getByDisputeCode(String disputeCode) {
        return disputeRepository.findByDisputeCode(disputeCode)
            .orElseThrow(() -> new RuntimeException("Dispute not found: " + disputeCode));
    }
    
    public List<PaymentDispute> getUserDisputes(Long userId) {
        return disputeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<PaymentDispute> getByStatus(String status) {
        return disputeRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public PaymentDispute resolveDispute(Long disputeId, String resolution, String resolutionNote, Long resolvedBy) {
        PaymentDispute dispute = disputeRepository.findById(disputeId)
            .orElseThrow(() -> new RuntimeException("Dispute not found"));
        
        dispute.setStatus(resolution);
        dispute.setResolutionNote(resolutionNote);
        dispute.setResolvedBy(resolvedBy);
        
        return disputeRepository.save(dispute);
    }
}
