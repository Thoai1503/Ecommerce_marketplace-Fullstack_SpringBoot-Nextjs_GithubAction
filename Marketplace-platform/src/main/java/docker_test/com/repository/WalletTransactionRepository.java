package docker_test.com.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import docker_test.com.models.wallet.WalletTransaction;
import docker_test.com.models.wallet.WalletDirection;
import docker_test.com.models.wallet.WalletSourceType;
import docker_test.com.models.wallet.WalletTransactionStatus;
import docker_test.com.models.wallet.WalletTransactionType;
import jakarta.persistence.LockModeType;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    Optional<WalletTransaction> findByTransactionNo(String transactionNo);

    Optional<WalletTransaction> findByIdempotencyKey(String idempotencyKey);

    Optional<WalletTransaction> findByTransactionNoAndTransactionType(String transactionNo, WalletTransactionType transactionType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select wt from WalletTransaction wt where wt.transactionNo = :transactionNo and wt.transactionType = :transactionType")
    Optional<WalletTransaction> findByTransactionNoAndTransactionTypeForUpdate(String transactionNo, WalletTransactionType transactionType);

    boolean existsByDirectionAndTransactionTypeAndSourceTypeAndSourceIdAndStatus(
            WalletDirection direction,
            WalletTransactionType transactionType,
            WalletSourceType sourceType,
            Long sourceId,
            WalletTransactionStatus status
    );

    Page<WalletTransaction> findByWallet_IdOrderByCreatedAtDesc(Long walletId, Pageable pageable);
}
