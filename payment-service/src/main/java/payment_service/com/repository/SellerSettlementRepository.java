package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.SellerSettlement;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface SellerSettlementRepository extends JpaRepository<SellerSettlement, Long> {
    Optional<SellerSettlement> findBySettlementCode(String settlementCode);
    List<SellerSettlement> findByShopIdOrderByCreatedAtDesc(Long shopId);
    List<SellerSettlement> findByStatusOrderByCreatedAtDesc(String status);
    List<SellerSettlement> findByShopIdAndStatusOrderByCreatedAtDesc(Long shopId, String status);
}
