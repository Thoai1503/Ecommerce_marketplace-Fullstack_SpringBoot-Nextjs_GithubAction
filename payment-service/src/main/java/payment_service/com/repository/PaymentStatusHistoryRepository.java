package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentStatusHistory;
import java.util.List;

@Repository
public interface PaymentStatusHistoryRepository extends JpaRepository<PaymentStatusHistory, Long> {
    List<PaymentStatusHistory> findByTransactionIdOrderByCreatedAtDesc(Long transactionId);

    boolean existsByTransactionIdAndToStatusAndChangedByAndActorIdAndReason(
        Long transactionId,
        String toStatus,
        String changedBy,
        Long actorId,
        String reason
    );
}
