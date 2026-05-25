package docker_test.com.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import docker_test.com.models.wallet.UserWallet;
import jakarta.persistence.LockModeType;

@Repository
public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {

    Optional<UserWallet> findByUserId(Long userId);

    Optional<UserWallet> findByWalletCode(String walletCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from UserWallet w where w.id = :id")
    Optional<UserWallet> findByIdForUpdate(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from UserWallet w where w.userId = :userId")
    Optional<UserWallet> findByUserIdForUpdate(Long userId);
}
