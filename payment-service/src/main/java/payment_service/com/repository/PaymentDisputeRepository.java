package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentDispute;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentDisputeRepository extends JpaRepository<PaymentDispute, Long> {
    Optional<PaymentDispute> findByDisputeCode(String disputeCode);
    List<PaymentDispute> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PaymentDispute> findByStatusOrderByCreatedAtDesc(String status);
    List<PaymentDispute> findByTransactionIdOrderByCreatedAtDesc(Long transactionId);
}
