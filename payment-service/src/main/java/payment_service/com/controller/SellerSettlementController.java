package payment_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import payment_service.com.entity.SellerSettlement;
import payment_service.com.service.SellerSettlementService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/settlements")
@RequiredArgsConstructor
public class SellerSettlementController {
    
    private final SellerSettlementService settlementService;
    
    @PostMapping
    public ResponseEntity<SellerSettlement> createSettlement(@RequestBody SellerSettlement settlement) {
        SellerSettlement created = settlementService.createSettlement(settlement);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/{settlementCode}")
    public ResponseEntity<SellerSettlement> getSettlement(@PathVariable String settlementCode) {
        SellerSettlement settlement = settlementService.getBySettlementCode(settlementCode);
        return ResponseEntity.ok(settlement);
    }
    
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<SellerSettlement>> getShopSettlements(@PathVariable Long shopId) {
        List<SellerSettlement> settlements = settlementService.getShopSettlements(shopId);
        return ResponseEntity.ok(settlements);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SellerSettlement>> getByStatus(@PathVariable String status) {
        List<SellerSettlement> settlements = settlementService.getByStatus(status);
        return ResponseEntity.ok(settlements);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<SellerSettlement> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        SellerSettlement settlement = settlementService.updateSettlementStatus(id, status);
        return ResponseEntity.ok(settlement);
    }
}
