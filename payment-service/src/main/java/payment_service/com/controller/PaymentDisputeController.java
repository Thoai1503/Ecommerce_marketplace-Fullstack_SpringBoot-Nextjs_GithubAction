package payment_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.PaymentDispute;
import payment_service.com.service.PaymentDisputeService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/disputes")
@RequiredArgsConstructor
public class PaymentDisputeController {
    
    private final PaymentDisputeService disputeService;
    
    @PostMapping
    public ResponseEntity<PaymentDispute> createDispute(@RequestBody PaymentDispute dispute) {
        PaymentDispute created = disputeService.createDispute(dispute);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/{disputeCode}")
    public ResponseEntity<PaymentDispute> getDispute(@PathVariable String disputeCode) {
        PaymentDispute dispute = disputeService.getByDisputeCode(disputeCode);
        return ResponseEntity.ok(dispute);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentDispute>> getUserDisputes(@PathVariable Long userId) {
        List<PaymentDispute> disputes = disputeService.getUserDisputes(userId);
        return ResponseEntity.ok(disputes);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentDispute>> getByStatus(@PathVariable String status) {
        List<PaymentDispute> disputes = disputeService.getByStatus(status);
        return ResponseEntity.ok(disputes);
    }
    
    @PutMapping("/{id}/resolve")
    public ResponseEntity<PaymentDispute> resolveDispute(
            @PathVariable Long id,
            @RequestParam String resolution,
            @RequestParam(required = false) String resolutionNote,
            @RequestParam Long resolvedBy) {
        PaymentDispute dispute = disputeService.resolveDispute(id, resolution, resolutionNote, resolvedBy);
        return ResponseEntity.ok(dispute);
    }
}
