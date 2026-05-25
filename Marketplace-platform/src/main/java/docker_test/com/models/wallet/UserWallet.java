package docker_test.com.models.wallet;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "user_wallet",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_wallet_user", columnNames = "user_id"),
                @UniqueConstraint(name = "uq_wallet_code", columnNames = "wallet_code")
        },
        indexes = {
                @Index(name = "idx_wallet_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "wallet_code", nullable = false, length = 40)
    private String walletCode;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "available_balance", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Column(name = "pending_balance", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal pendingBalance = BigDecimal.ZERO;

    @Column(name = "locked_balance", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal lockedBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private UserWalletStatus status = UserWalletStatus.ACTIVE;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;

        availableBalance = normalize(availableBalance);
        pendingBalance = normalize(pendingBalance);
        lockedBalance = normalize(lockedBalance);
        currency = currency == null ? "VND" : currency.trim().toUpperCase();
        if (status == null) {
            status = UserWalletStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
        availableBalance = normalize(availableBalance);
        pendingBalance = normalize(pendingBalance);
        lockedBalance = normalize(lockedBalance);
    }

    public void assertActive() {
        if (status != UserWalletStatus.ACTIVE) {
            throw new IllegalStateException("Wallet is not active");
        }
    }

    public void credit(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Credit amount must be greater than 0");
        availableBalance = availableBalance.add(normalizedAmount);
    }

    public void debit(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Debit amount must be greater than 0");
        if (availableBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalStateException("Insufficient available balance");
        }
        availableBalance = availableBalance.subtract(normalizedAmount);
    }

    public void moveAvailableToPending(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Amount must be greater than 0");
        if (availableBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalStateException("Insufficient available balance");
        }
        availableBalance = availableBalance.subtract(normalizedAmount);
        pendingBalance = pendingBalance.add(normalizedAmount);
    }

    public void consumePending(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Amount must be greater than 0");
        if (pendingBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalStateException("Insufficient pending balance");
        }
        pendingBalance = pendingBalance.subtract(normalizedAmount);
    }

    public void releasePendingToAvailable(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Amount must be greater than 0");
        if (pendingBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalStateException("Insufficient pending balance");
        }
        pendingBalance = pendingBalance.subtract(normalizedAmount);
        availableBalance = availableBalance.add(normalizedAmount);
    }

    public void moveAvailableToLocked(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Amount must be greater than 0");
        if (availableBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalStateException("Insufficient available balance");
        }
        availableBalance = availableBalance.subtract(normalizedAmount);
        lockedBalance = lockedBalance.add(normalizedAmount);
    }

    public void releaseLockedToAvailable(BigDecimal amount) {
        BigDecimal normalizedAmount = positive(amount, "Amount must be greater than 0");
        if (lockedBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalStateException("Insufficient locked balance");
        }
        lockedBalance = lockedBalance.subtract(normalizedAmount);
        availableBalance = availableBalance.add(normalizedAmount);
    }

    private BigDecimal positive(BigDecimal amount, String message) {
        BigDecimal normalizedAmount = normalize(amount);
        if (normalizedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(message);
        }
        return normalizedAmount;
    }

    private BigDecimal normalize(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
