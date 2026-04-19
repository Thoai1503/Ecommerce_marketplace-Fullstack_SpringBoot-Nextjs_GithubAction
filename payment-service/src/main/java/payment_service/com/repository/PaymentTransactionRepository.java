package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentTransaction;
import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByTxnCode(String txnCode);
    Optional<PaymentTransaction> findByOrderId(Long orderId);
    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PaymentTransaction> findByTxnTypeAndStatusOrderByCreatedAtDesc(String txnType, String status);
    List<PaymentTransaction> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(String status, LocalDateTime from, LocalDateTime to);
    List<PaymentTransaction> findByPayerTypeAndPayerIdOrderByCreatedAtDesc(String payerType, Long payerId);
    List<PaymentTransaction> findByPayeeTypeAndPayeeIdOrderByCreatedAtDesc(String payeeType, Long payeeId);
}
