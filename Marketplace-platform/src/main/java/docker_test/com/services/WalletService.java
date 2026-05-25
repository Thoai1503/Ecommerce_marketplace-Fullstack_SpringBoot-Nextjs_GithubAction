package docker_test.com.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import docker_test.com.dto.wallet.WalletCreditDebitRequest;
import docker_test.com.dto.wallet.WalletTransferRequest;
import docker_test.com.dto.wallet.WalletWithdrawDecisionRequest;
import docker_test.com.models.wallet.UserWallet;
import docker_test.com.models.wallet.UserWalletStatus;
import docker_test.com.models.wallet.WalletDirection;
import docker_test.com.models.wallet.WalletSourceType;
import docker_test.com.models.wallet.WalletTransaction;
import docker_test.com.models.wallet.WalletTransactionStatus;
import docker_test.com.models.wallet.WalletTransactionType;
import docker_test.com.repository.OrderShipmentRepository;
import docker_test.com.repository.UserWalletRepository;
import docker_test.com.repository.WalletTransactionRepository;
import jakarta.transaction.Transactional;

@Service
public class WalletService {

    private final OrderShipmentRepository orderShipmentRepository;
    private final UserWalletRepository userWalletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletService(OrderShipmentRepository orderShipmentRepository,
                         UserWalletRepository userWalletRepository,
                         WalletTransactionRepository walletTransactionRepository) {
        this.orderShipmentRepository = orderShipmentRepository;
        this.userWalletRepository = userWalletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @Transactional
    public UserWallet createWallet(Long userId, String walletCode, String currency) {
        return createWallet(userId, walletCode, currency, null);
    }

    @Transactional
    public UserWallet createWallet(Long userId, String walletCode, String currency, String status) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        if (walletCode == null || walletCode.isBlank()) {
            throw new IllegalArgumentException("walletCode is required");
        }

        userWalletRepository.findByUserId(userId).ifPresent(existing -> {
            throw new IllegalStateException("Wallet already exists for this user");
        });
        userWalletRepository.findByWalletCode(walletCode).ifPresent(existing -> {
            throw new IllegalStateException("walletCode already exists");
        });

        UserWalletStatus walletStatus = UserWalletStatus.ACTIVE;
        if (status != null && !status.isBlank()) {
            try {
                walletStatus = UserWalletStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid wallet status: " + status);
            }
        }

        UserWallet wallet = UserWallet.builder()
                .userId(userId)
                .walletCode(walletCode.trim())
                .currency(normalizeCurrency(currency))
                .status(walletStatus)
                .build();

        return userWalletRepository.save(wallet);
    }

    public Optional<UserWallet> getWalletById(Long walletId) {
        if (walletId == null) {
            return Optional.empty();
        }
        return userWalletRepository.findById(walletId);
    }

    public Optional<UserWallet> getWalletByUserId(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return userWalletRepository.findByUserId(userId);
    }

    @Transactional
    public WalletTransaction credit(WalletCreditDebitRequest request) {
        WalletTransaction idempotent = findIdempotent(request.getIdempotencyKey());
        if (idempotent != null) {
            return idempotent;
        }

        UserWallet wallet = lockWallet(request.getWalletId());
        // Admin credit is allowed for ACTIVE and SUSPENDED wallets.
        if (wallet.getStatus() == UserWalletStatus.CLOSED) {
            throw new IllegalStateException("Wallet is closed");
        }

        BigDecimal amount = normalizeAmount(request.getAmount(), true);
        BigDecimal fee = normalizeAmount(request.getFeeAmount(), false);

        BigDecimal before = wallet.getAvailableBalance();
        // user_wallet balance is updated by DB trigger on wallet_transaction insert.
        // Avoid direct entity update here to prevent optimistic lock conflict on version.
        BigDecimal after = before.add(amount);
        WalletTransactionType transactionType = defaultType(
            request.getTransactionType(),
            WalletTransactionType.MANUAL_ADJUSTMENT
        );
        WalletSourceType sourceType = defaultSource(request.getSourceType());

        if (isDuplicateShopPayout(transactionType, sourceType, request.getSourceId())) {
            throw new IllegalStateException("Order shipment payout already settled");
        }

        WalletTransaction tx = buildTransaction(
                wallet,
                null,
                transactionNo("CR"),
                request.getIdempotencyKey(),
                WalletDirection.CREDIT,
            transactionType,
            sourceType,
                request.getSourceId(),
                amount,
                fee,
                before,
                after,
                WalletTransactionStatus.COMPLETED,
                request.getNote(),
                request.getMetadata(),
                request.getCreatedBy(),
                null,
                null
        );

            WalletTransaction savedTx = walletTransactionRepository.save(tx);
            markOrderShipmentSettledIfNeeded(transactionType, sourceType, request.getSourceId());
            return savedTx;
    }

    @Transactional
    public WalletTransaction debit(WalletCreditDebitRequest request) {
        WalletTransaction idempotent = findIdempotent(request.getIdempotencyKey());
        if (idempotent != null) {
            return idempotent;
        }

        UserWallet wallet = lockWallet(request.getWalletId());
        wallet.assertActive();

        BigDecimal amount = normalizeAmount(request.getAmount(), true);
        BigDecimal fee = normalizeAmount(request.getFeeAmount(), false);
        BigDecimal totalDeduct = amount.add(fee);

        BigDecimal before = wallet.getAvailableBalance();
        wallet.debit(totalDeduct);
        BigDecimal after = wallet.getAvailableBalance();

        userWalletRepository.save(wallet);

        WalletTransaction tx = buildTransaction(
                wallet,
                null,
                transactionNo("DB"),
                request.getIdempotencyKey(),
                WalletDirection.DEBIT,
                defaultType(request.getTransactionType(), WalletTransactionType.MANUAL_ADJUSTMENT),
                defaultSource(request.getSourceType()),
                request.getSourceId(),
                amount,
                fee,
                before,
                after,
                WalletTransactionStatus.COMPLETED,
                request.getNote(),
                request.getMetadata(),
                request.getCreatedBy(),
                null,
                null
        );

        return walletTransactionRepository.save(tx);
    }

    @Transactional
    public WalletTransaction transfer(WalletTransferRequest request) {
        WalletTransaction idempotent = findIdempotent(request.getIdempotencyKey());
        if (idempotent != null) {
            return idempotent;
        }

        if (request.getFromWalletId() == null || request.getToWalletId() == null) {
            throw new IllegalArgumentException("fromWalletId and toWalletId are required");
        }
        if (request.getFromWalletId().equals(request.getToWalletId())) {
            throw new IllegalArgumentException("Cannot transfer to the same wallet");
        }

        Long firstLockId = Math.min(request.getFromWalletId(), request.getToWalletId());
        Long secondLockId = Math.max(request.getFromWalletId(), request.getToWalletId());

        UserWallet first = lockWallet(firstLockId);
        UserWallet second = lockWallet(secondLockId);

        UserWallet from = first.getId().equals(request.getFromWalletId()) ? first : second;
        UserWallet to = from == first ? second : first;

        from.assertActive();
        to.assertActive();

        if (!from.getCurrency().equalsIgnoreCase(to.getCurrency())) {
            throw new IllegalStateException("Currency mismatch between wallets");
        }

        BigDecimal amount = normalizeAmount(request.getAmount(), true);
        BigDecimal fee = normalizeAmount(request.getFeeAmount(), false);
        BigDecimal totalDeduct = amount.add(fee);

        BigDecimal beforeFrom = from.getAvailableBalance();
        BigDecimal beforeTo = to.getAvailableBalance();

        from.debit(totalDeduct);
        to.credit(amount);

        userWalletRepository.save(from);
        userWalletRepository.save(to);

        String transferRef = transactionNo("TR");

        WalletTransaction debitTx = buildTransaction(
                from,
                to,
                transferRef + "-D",
                request.getIdempotencyKey(),
                WalletDirection.DEBIT,
                defaultType(request.getTransactionType(), WalletTransactionType.SHOP_PAYOUT),
                defaultSource(request.getSourceType()),
                request.getSourceId(),
                amount,
                fee,
                beforeFrom,
                from.getAvailableBalance(),
                WalletTransactionStatus.COMPLETED,
                defaultNote(request.getNote(), "Transfer out to wallet " + to.getWalletCode()),
                request.getMetadata(),
                request.getCreatedBy(),
                null,
                null
        );

        WalletTransaction creditTx = buildTransaction(
                to,
                from,
                transferRef + "-C",
                null,
                WalletDirection.CREDIT,
                WalletTransactionType.BUYER_REFUND,
                defaultSource(request.getSourceType()),
                request.getSourceId(),
                amount,
                BigDecimal.ZERO,
                beforeTo,
                to.getAvailableBalance(),
                WalletTransactionStatus.COMPLETED,
                defaultNote(request.getNote(), "Transfer in from wallet " + from.getWalletCode()),
                request.getMetadata(),
                request.getCreatedBy(),
                null,
                null
        );

        walletTransactionRepository.save(creditTx);
        return walletTransactionRepository.save(debitTx);
    }

    @Transactional
    public WalletTransaction requestWithdraw(WalletCreditDebitRequest request) {
        WalletTransaction idempotent = findIdempotent(request.getIdempotencyKey());
        if (idempotent != null) {
            return idempotent;
        }

        UserWallet wallet = lockWallet(request.getWalletId());
        wallet.assertActive();

        BigDecimal amount = normalizeAmount(request.getAmount(), true);

        BigDecimal before = wallet.getAvailableBalance();
        wallet.moveAvailableToPending(amount);
        BigDecimal after = wallet.getAvailableBalance();

        userWalletRepository.save(wallet);

        WalletTransaction requestTx = buildTransaction(
                wallet,
                null,
                transactionNo("WDREQ"),
                request.getIdempotencyKey(),
                WalletDirection.DEBIT,
                WalletTransactionType.WITHDRAW_REQUEST,
                WalletSourceType.WITHDRAWAL,
                request.getSourceId(),
                amount,
                BigDecimal.ZERO,
                before,
                after,
                WalletTransactionStatus.PENDING,
                request.getNote(),
                request.getMetadata(),
                request.getCreatedBy(),
                null,
                null
        );

        return walletTransactionRepository.save(requestTx);
    }

    @Transactional
    public WalletTransaction approveWithdraw(WalletWithdrawDecisionRequest request) {
        WalletTransaction requestTx = lockPendingWithdrawRequest(request.getRequestTransactionNo());

        UserWallet wallet = lockWallet(requestTx.getWallet().getId());
        wallet.assertActive();

        BigDecimal amount = requestTx.getAmount();
        BigDecimal before = wallet.getAvailableBalance();

        wallet.consumePending(amount);
        userWalletRepository.save(wallet);

        requestTx.setStatus(WalletTransactionStatus.COMPLETED);
        requestTx.setApprovedBy(request.getApprovedBy());
        requestTx.setApprovedAt(LocalDateTime.now());
        requestTx.setNote(appendNote(requestTx.getNote(), request.getNote()));
        walletTransactionRepository.save(requestTx);

        WalletTransaction successTx = buildTransaction(
                wallet,
                null,
                transactionNo("WDSUC"),
                null,
                WalletDirection.DEBIT,
                WalletTransactionType.WITHDRAW_SUCCESS,
                WalletSourceType.WITHDRAWAL,
                requestTx.getId(),
                amount,
                BigDecimal.ZERO,
                before,
                wallet.getAvailableBalance(),
                WalletTransactionStatus.COMPLETED,
                defaultNote(request.getNote(), "Withdraw approved"),
                requestTx.getMetadata(),
                requestTx.getCreatedBy(),
                request.getApprovedBy(),
                LocalDateTime.now()
        );

        return walletTransactionRepository.save(successTx);
    }

    @Transactional
    public WalletTransaction rejectWithdraw(WalletWithdrawDecisionRequest request) {
        WalletTransaction requestTx = lockPendingWithdrawRequest(request.getRequestTransactionNo());

        UserWallet wallet = lockWallet(requestTx.getWallet().getId());
        wallet.assertActive();

        BigDecimal amount = requestTx.getAmount();
        BigDecimal before = wallet.getAvailableBalance();

        wallet.releasePendingToAvailable(amount);
        userWalletRepository.save(wallet);

        requestTx.setStatus(WalletTransactionStatus.CANCELLED);
        requestTx.setApprovedBy(request.getApprovedBy());
        requestTx.setApprovedAt(LocalDateTime.now());
        requestTx.setNote(appendNote(requestTx.getNote(), request.getNote()));
        walletTransactionRepository.save(requestTx);

        WalletTransaction rejectTx = buildTransaction(
                wallet,
                null,
                transactionNo("WDREJ"),
                null,
                WalletDirection.CREDIT,
                WalletTransactionType.WITHDRAW_REJECT,
                WalletSourceType.WITHDRAWAL,
                requestTx.getId(),
                amount,
                BigDecimal.ZERO,
                before,
                wallet.getAvailableBalance(),
                WalletTransactionStatus.COMPLETED,
                defaultNote(request.getNote(), "Withdraw rejected and refunded to available balance"),
                requestTx.getMetadata(),
                requestTx.getCreatedBy(),
                request.getApprovedBy(),
                LocalDateTime.now()
        );

        return walletTransactionRepository.save(rejectTx);
    }

    public Page<WalletTransaction> getWalletTransactions(Long walletId, int page, int size) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return walletTransactionRepository.findByWallet_IdOrderByCreatedAtDesc(walletId, pageable);
    }

    private WalletTransaction lockPendingWithdrawRequest(String transactionNo) {
        if (transactionNo == null || transactionNo.isBlank()) {
            throw new IllegalArgumentException("requestTransactionNo is required");
        }

        WalletTransaction requestTx = walletTransactionRepository
            .findByTransactionNoAndTransactionTypeForUpdate(transactionNo, WalletTransactionType.WITHDRAW_REQUEST)
                .orElseThrow(() -> new IllegalStateException("Withdraw request transaction not found"));

        if (requestTx.getStatus() != WalletTransactionStatus.PENDING) {
            throw new IllegalStateException("Withdraw request is not in pending state");
        }

        return requestTx;
    }

    private UserWallet lockWallet(Long walletId) {
        if (walletId == null) {
            throw new IllegalArgumentException("walletId is required");
        }
        return userWalletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new IllegalStateException("Wallet not found"));
    }

    private WalletTransaction buildTransaction(UserWallet wallet,
                                               UserWallet counterpartyWallet,
                                               String transactionNo,
                                               String idempotencyKey,
                                               WalletDirection direction,
                                               WalletTransactionType transactionType,
                                               WalletSourceType sourceType,
                                               Long sourceId,
                                               BigDecimal amount,
                                               BigDecimal feeAmount,
                                               BigDecimal balanceBefore,
                                               BigDecimal balanceAfter,
                                               WalletTransactionStatus status,
                                               String note,
                                               String metadata,
                                               Long createdBy,
                                               Long approvedBy,
                                               LocalDateTime approvedAt) {

        return WalletTransaction.builder()
                .wallet(wallet)
                .counterpartyWallet(counterpartyWallet)
                .transactionNo(transactionNo)
                .idempotencyKey(idempotencyKey)
                .direction(direction)
                .transactionType(transactionType)
                .sourceType(sourceType)
                .sourceId(sourceId)
                .amount(normalizeAmount(amount, true))
                .feeAmount(normalizeAmount(feeAmount, false))
                .balanceBefore(normalizeAmount(balanceBefore, false))
                .balanceAfter(normalizeAmount(balanceAfter, false))
                .status(status)
                .note(note)
                .metadata(metadata)
                .createdBy(createdBy)
                .approvedBy(approvedBy)
                .approvedAt(approvedAt)
                .build();
    }

    private WalletTransaction findIdempotent(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        return walletTransactionRepository.findByIdempotencyKey(idempotencyKey.trim()).orElse(null);
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "VND";
        }
        return currency.trim().toUpperCase();
    }

    private WalletTransactionType defaultType(WalletTransactionType value, WalletTransactionType defaultValue) {
        return value == null ? defaultValue : value;
    }

    private WalletSourceType defaultSource(WalletSourceType sourceType) {
        return sourceType == null ? WalletSourceType.SYSTEM : sourceType;
    }

    private void markOrderShipmentSettledIfNeeded(WalletTransactionType transactionType,
                                                   WalletSourceType sourceType,
                                                   Long sourceId) {
        if (transactionType != WalletTransactionType.SHOP_PAYOUT
                || sourceType != WalletSourceType.ORDER_SHIPMENT
                || sourceId == null) {
            return;
        }
        orderShipmentRepository.markPayoutSettled(sourceId);
    }

    private boolean isDuplicateShopPayout(WalletTransactionType transactionType,
                                          WalletSourceType sourceType,
                                          Long sourceId) {
        if (transactionType != WalletTransactionType.SHOP_PAYOUT
                || sourceType != WalletSourceType.ORDER_SHIPMENT
                || sourceId == null) {
            return false;
        }
        return walletTransactionRepository.existsByDirectionAndTransactionTypeAndSourceTypeAndSourceIdAndStatus(
                WalletDirection.CREDIT,
                WalletTransactionType.SHOP_PAYOUT,
                WalletSourceType.ORDER_SHIPMENT,
                sourceId,
                WalletTransactionStatus.COMPLETED
        );
    }

    private String defaultNote(String note, String fallback) {
        return (note == null || note.isBlank()) ? fallback : note;
    }

    private BigDecimal normalizeAmount(BigDecimal amount, boolean requiredPositive) {
        BigDecimal normalized = amount == null
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : amount.setScale(2, RoundingMode.HALF_UP);

        if (requiredPositive && normalized.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (!requiredPositive && normalized.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        return normalized;
    }

    private String appendNote(String existing, String append) {
        if (append == null || append.isBlank()) {
            return existing;
        }
        if (existing == null || existing.isBlank()) {
            return append;
        }
        return existing + " | " + append;
    }

    private String transactionNo(String prefix) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return (prefix + "-" + timestamp + "-" + random).substring(0, Math.min(50, prefix.length() + 1 + timestamp.length() + 1 + random.length()));
    }
}
