package payment_service.com.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.*;
import payment_service.com.repository.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerSettlementService {
    
    private final SellerSettlementRepository settlementRepository;
    private final SellerSettlementItemRepository settlementItemRepository;
    
    public SellerSettlement createSettlement(SellerSettlement settlement) {
        return settlementRepository.save(settlement);
    }
    
    public SellerSettlement getBySettlementCode(String settlementCode) {
        return settlementRepository.findBySettlementCode(settlementCode)
            .orElseThrow(() -> new RuntimeException("Settlement not found: " + settlementCode));
    }
    
    public List<SellerSettlement> getShopSettlements(Long shopId) {
        return settlementRepository.findByShopIdOrderByCreatedAtDesc(shopId);
    }
    
    public List<SellerSettlement> getByStatus(String status) {
        return settlementRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public void addSettlementItem(SellerSettlementItem item) {
        settlementItemRepository.save(item);
    }
    
    public List<SellerSettlementItem> getSettlementItems(Long settlementId) {
        return settlementItemRepository.findBySettlementIdOrderByCreatedAtDesc(settlementId);
    }
    
    public SellerSettlement updateSettlementStatus(Long settlementId, String newStatus) {
        SellerSettlement settlement = settlementRepository.findById(settlementId)
            .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        settlement.setStatus(newStatus);
        settlement.setUpdatedAt(LocalDateTime.now());
        
        if ("PAID".equals(newStatus)) {
            settlement.setPaidAt(LocalDateTime.now());
        }
        
        return settlementRepository.save(settlement);
    }
}
