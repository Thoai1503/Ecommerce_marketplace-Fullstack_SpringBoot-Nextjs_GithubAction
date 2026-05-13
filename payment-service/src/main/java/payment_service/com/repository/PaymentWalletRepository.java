package payment_service.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.com.entity.PaymentWallet;
import java.util.Optional;

@Repository
public interface PaymentWalletRepository extends JpaRepository<PaymentWallet, Long> {
    Optional<PaymentWallet> findByUserId(Long userId);
}
