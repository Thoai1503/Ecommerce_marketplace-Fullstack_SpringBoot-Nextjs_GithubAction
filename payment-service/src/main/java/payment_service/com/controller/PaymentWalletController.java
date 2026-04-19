package payment_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.PaymentWallet;
import payment_service.com.service.PaymentWalletService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class PaymentWalletController {
    
    private final PaymentWalletService walletService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<PaymentWallet> getWallet(@PathVariable Long userId) {
        PaymentWallet wallet = walletService.getOrCreateWallet(userId);
        return ResponseEntity.ok(wallet);
    }
    
    @PostMapping("/{userId}/credit")
    public ResponseEntity<Map<String, String>> creditWallet(
            @PathVariable Long userId,
            @RequestParam Long amount,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId,
            @RequestParam(required = false) String description) {
        walletService.creditWallet(userId, amount, refType, refId, description);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Wallet credited"));
    }
    
    @PostMapping("/{userId}/debit")
    public ResponseEntity<Map<String, String>> debitWallet(
            @PathVariable Long userId,
            @RequestParam Long amount,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId,
            @RequestParam(required = false) String description) {
        walletService.debitWallet(userId, amount, refType, refId, description);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Wallet debited"));
    }
    
    @GetMapping("/{userId}/history")
    public ResponseEntity<List<?>> getWalletHistory(@PathVariable Long userId) {
        var history = walletService.getWalletHistory(userId);
        return ResponseEntity.ok(history);
    }
}
