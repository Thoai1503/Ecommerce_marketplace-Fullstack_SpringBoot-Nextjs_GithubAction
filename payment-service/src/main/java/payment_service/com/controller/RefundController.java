package payment_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.RefundRequest;
import payment_service.com.service.RefundService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/refunds")
@RequiredArgsConstructor
public class RefundController {
    
    private final RefundService refundService;
    
    @PostMapping
    public ResponseEntity<RefundRequest> createRefund(@RequestBody RefundRequest refund) {
        RefundRequest created = refundService.createRefund(refund);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/{refundCode}")
    public ResponseEntity<RefundRequest> getRefund(@PathVariable String refundCode) {
        RefundRequest refund = refundService.getByRefundCode(refundCode);
        return ResponseEntity.ok(refund);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RefundRequest>> getUserRefunds(@PathVariable Long userId) {
        List<RefundRequest> refunds = refundService.getUserRefunds(userId);
        return ResponseEntity.ok(refunds);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RefundRequest>> getByStatus(@PathVariable String status) {
        List<RefundRequest> refunds = refundService.getByStatus(status);
        return ResponseEntity.ok(refunds);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<RefundRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason,
            @RequestParam String changedBy,
            @RequestParam(required = false) Long actorId) {
        RefundRequest refund = refundService.updateRefundStatus(id, status, reason, changedBy, actorId);
        return ResponseEntity.ok(refund);
    }
}
