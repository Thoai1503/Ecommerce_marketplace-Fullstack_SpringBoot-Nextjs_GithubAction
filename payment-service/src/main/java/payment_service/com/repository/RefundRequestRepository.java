package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.RefundRequest;
import java.util.Optional;
import java.util.List;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    Optional<RefundRequest> findByRefundCode(String refundCode);
    List<RefundRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RefundRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<RefundRequest> findByTransactionIdOrderByCreatedAtDesc(Long transactionId);
}
