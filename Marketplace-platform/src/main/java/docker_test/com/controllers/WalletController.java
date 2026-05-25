package docker_test.com.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.wallet.CreateWalletRequest;
import docker_test.com.dto.wallet.WalletCreditDebitRequest;
import docker_test.com.dto.wallet.WalletTransferRequest;
import docker_test.com.dto.wallet.WalletWithdrawDecisionRequest;
import docker_test.com.services.WalletService;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WalletController.class);

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("")
    public ResponseEntity<?> createWallet(@RequestBody CreateWalletRequest request) {
        try {
            var created = walletService.createWallet(
                    request.getUserId(),
                    request.getWalletCode(),
                    request.getCurrency(),
                    request.getStatus()
            );
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating wallet: " + ex.getMessage());
        }
    }

    @GetMapping("/{walletId}")
    public ResponseEntity<?> getWalletById(@PathVariable Long walletId) {
        try {
            var wallet = walletService.getWalletById(walletId);
            if (wallet.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wallet not found");
            }
            return ResponseEntity.ok(wallet.get());
        } catch (Exception ex) {
        	
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching wallet: " + ex.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getWalletByUserId(@PathVariable Long userId) {
        try {
            var wallet = walletService.getWalletByUserId(userId);
            if (wallet.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wallet not found for this user");
            }
            return ResponseEntity.ok(wallet.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching wallet by userId: " + ex.getMessage());
        }
    }

    @PostMapping("/credit")
    public ResponseEntity<?> credit(@RequestBody WalletCreditDebitRequest request) {
        try {
            return ResponseEntity.ok(walletService.credit(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
        	logger.error("Error crediting wallet", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            		
                    .body("Error credit wallet: " + ex.getMessage());
        }
    }

    @PostMapping("/debit")
    public ResponseEntity<?> debit(@RequestBody WalletCreditDebitRequest request) {
        try {
            return ResponseEntity.ok(walletService.debit(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error debit wallet: " + ex.getMessage());
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody WalletTransferRequest request) {
        try {
            return ResponseEntity.ok(walletService.transfer(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error transfer wallet: " + ex.getMessage());
        }
    }

    @PostMapping("/withdraw/request")
    public ResponseEntity<?> requestWithdraw(@RequestBody WalletCreditDebitRequest request) {
        try {
            return ResponseEntity.ok(walletService.requestWithdraw(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error request withdraw: " + ex.getMessage());
        }
    }

    @PostMapping("/withdraw/approve")
    public ResponseEntity<?> approveWithdraw(@RequestBody WalletWithdrawDecisionRequest request) {
        try {
            return ResponseEntity.ok(walletService.approveWithdraw(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error approve withdraw: " + ex.getMessage());
        }
    }

    @PostMapping("/withdraw/reject")
    public ResponseEntity<?> rejectWithdraw(@RequestBody WalletWithdrawDecisionRequest request) {
        try {
            return ResponseEntity.ok(walletService.rejectWithdraw(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reject withdraw: " + ex.getMessage());
        }
    }

    @GetMapping("/{walletId}/transactions")
    public ResponseEntity<?> getWalletTransactions(
            @PathVariable Long walletId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            var txPage = walletService.getWalletTransactions(walletId, page, size);
            return ResponseEntity.ok(Map.of(
                    "content", txPage.getContent(),
                    "page", txPage.getNumber(),
                    "size", txPage.getSize(),
                    "totalElements", txPage.getTotalElements(),
                    "totalPages", txPage.getTotalPages(),
                    "last", txPage.isLast()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching wallet transactions: " + ex.getMessage());
        }
    }
}
