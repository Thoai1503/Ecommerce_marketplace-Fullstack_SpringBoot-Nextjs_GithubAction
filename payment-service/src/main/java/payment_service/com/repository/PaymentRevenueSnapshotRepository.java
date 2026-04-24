package payment_service.com.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentRevenueSnapshot;

@Repository
public interface PaymentRevenueSnapshotRepository extends JpaRepository<PaymentRevenueSnapshot, Long> {

    @Query("""
        select prs
        from PaymentRevenueSnapshot prs
        where (:txnType is null or prs.txnType = :txnType)
          and (:fromTime is null or prs.recognizedAt >= :fromTime)
          and (:toTime is null or prs.recognizedAt <= :toTime)
        order by prs.recognizedAt desc, prs.id desc
        """)
    List<PaymentRevenueSnapshot> search(
        @Param("txnType") String txnType,
        @Param("fromTime") LocalDateTime fromTime,
        @Param("toTime") LocalDateTime toTime
    );

    Optional<PaymentRevenueSnapshot> findTopByOrderByRecognizedAtDescIdDesc();
}