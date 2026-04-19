package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.SellerSettlementItem;
import java.util.List;

@Repository
public interface SellerSettlementItemRepository extends JpaRepository<SellerSettlementItem, Long> {
    List<SellerSettlementItem> findBySettlementIdOrderByCreatedAtDesc(Long settlementId);
    List<SellerSettlementItem> findByTransactionIdOrderByCreatedAtDesc(Long transactionId);
}
