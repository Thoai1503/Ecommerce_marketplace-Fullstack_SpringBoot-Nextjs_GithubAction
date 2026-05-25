package payment_service.com.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.*;
import payment_service.com.repository.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentWalletService {
    
    private final PaymentWalletRepository walletRepository;
    private final WalletTransactionRepository walletTxnRepository;
    
    public PaymentWallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
            .orElseGet(() -> {
                PaymentWallet wallet = PaymentWallet.builder()
                    .userId(userId)
                    .balance(0L)
                    .lockedBalance(0L)
                    .currency("VND")
                    .status(PaymentWalletStatus.ACTIVE)
                    .build();
                return walletRepository.save(wallet);
            });
    }
    
    public PaymentWallet getWallet(Long userId) {
        return walletRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
    }
    
    public void creditWallet(Long userId, Long amount, String refType, Long refId, String description) {
        PaymentWallet wallet = getOrCreateWallet(userId);
        Long balanceBefore = wallet.getBalance();
        
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);
        
        // Log transaction
        WalletTransaction txn = WalletTransaction.builder()
            .wallet(wallet)
            .userId(userId)
            .txnType("CREDIT")
            .amount(amount)
            .balanceBefore(balanceBefore)
            .balanceAfter(wallet.getBalance())
            .refType(refType)
            .refId(refId)
            .description(description)
            .build();
        
        walletTxnRepository.save(txn);
    }
    
    public void debitWallet(Long userId, Long amount, String refType, Long refId, String description) {
        PaymentWallet wallet = getOrCreateWallet(userId);
        Long balanceBefore = wallet.getBalance();
        
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance");
        }
        
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);
        
        // Log transaction
        WalletTransaction txn = WalletTransaction.builder()
            .wallet(wallet)
            .userId(userId)
            .txnType("DEBIT")
            .amount(amount)
            .balanceBefore(balanceBefore)
            .balanceAfter(wallet.getBalance())
            .refType(refType)
            .refId(refId)
            .description(description)
            .build();
        
        walletTxnRepository.save(txn);
    }
    
    public List<WalletTransaction> getWalletHistory(Long userId) {
        return walletTxnRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
