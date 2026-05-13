package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentWebhookEvent;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentWebhookEventRepository extends JpaRepository<PaymentWebhookEvent, Long> {
    Optional<PaymentWebhookEvent> findByGatewayCodeAndEventId(String gatewayCode, String eventId);
    List<PaymentWebhookEvent> findByIsProcessedFalseOrderByReceivedAtAsc();
}
