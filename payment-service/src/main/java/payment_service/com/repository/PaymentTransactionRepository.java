package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
        select pt
        from PaymentTransaction pt
        where pt.status = 'SUCCESS'
          and (:txnType is null or pt.txnType = :txnType)
          and (:fromTime is null or coalesce(pt.completedAt, pt.updatedAt) >= :fromTime)
          and (:toTime is null or coalesce(pt.completedAt, pt.updatedAt) <= :toTime)
        order by coalesce(pt.completedAt, pt.updatedAt) desc, pt.id desc
        """)
    List<PaymentTransaction> findSuccessfulTransactions(
        @Param("txnType") String txnType,
        @Param("fromTime") LocalDateTime fromTime,
        @Param("toTime") LocalDateTime toTime
    );
}
