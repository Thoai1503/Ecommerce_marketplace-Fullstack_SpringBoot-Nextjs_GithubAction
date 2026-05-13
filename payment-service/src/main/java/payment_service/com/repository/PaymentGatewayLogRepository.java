package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentGatewayLog;
import java.util.List;

@Repository
public interface PaymentGatewayLogRepository extends JpaRepository<PaymentGatewayLog, Long> {
    List<PaymentGatewayLog> findByTransactionIdOrderByCreatedAtDesc(Long transactionId);
    List<PaymentGatewayLog> findByGatewayCodeAndLogTypeOrderByCreatedAtDesc(String gatewayCode, String logType);
}
