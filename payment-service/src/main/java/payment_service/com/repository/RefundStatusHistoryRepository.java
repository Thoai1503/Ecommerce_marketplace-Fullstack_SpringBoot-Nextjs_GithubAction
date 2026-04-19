package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.RefundStatusHistory;
import java.util.List;

@Repository
public interface RefundStatusHistoryRepository extends JpaRepository<RefundStatusHistory, Long> {
    List<RefundStatusHistory> findByRefundIdOrderByCreatedAtDesc(Long refundId);
}
