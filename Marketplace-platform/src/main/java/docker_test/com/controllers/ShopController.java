package docker_test.com.controllers;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.Shop;
import docker_test.com.repository.ShopRepository;

@RestController
@RequestMapping("/shops")
public class ShopController {

    private ShopRepository shopRepository;

    public ShopController() {
        this.shopRepository = ShopRepository.Instance();
    }

    @GetMapping("")
    public ResponseEntity<?> getAll() {
        var list = shopRepository.GetAll();
        return ResponseEntity.ok(list);
    }

    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody Shop item) throws SQLException {
        if (item == null || item.getUser_id() <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid user_id");
        }

        Shop existingShop = shopRepository.GetByUserId(item.getUser_id());
        if (existingShop != null) {
            return ResponseEntity.status(409).body("User already has a shop");
        }

        var result = shopRepository.Create(item);
        return ResponseEntity.ok(result);
    }
    
    
    // ✅ Check user đã có shop chưa
    @GetMapping("/check")
    public ResponseEntity<?> checkShop(@RequestParam("user_id") int userId) {
        Shop shop = shopRepository.GetByUserId(userId);

        boolean hasShop = shop != null;
        boolean isComplete = false;

        if (hasShop) {
            String businessLicense = shop.getBusiness_license();
            String taxCode = shop.getTax_code();
            isComplete = businessLicense != null && !businessLicense.isBlank()
                    && taxCode != null && !taxCode.isBlank();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("hasShop", hasShop);
        response.put("isComplete", isComplete);
        response.put("shop", shop);

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        var shop = shopRepository.GetById(id);

        if (shop == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(shop);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompliance(@PathVariable int id,
            @RequestBody Map<String, String> payload) {
        Shop existing = shopRepository.GetById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        String businessLicense = payload.getOrDefault("business_license", existing.getBusiness_license());
        String taxCode = payload.getOrDefault("tax_code", existing.getTax_code());

        existing.setBusiness_license(businessLicense);
        existing.setTax_code(taxCode);
        existing.setUpdated_at(LocalDateTime.now());

        Shop updated = shopRepository.Update(existing);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }

        return ResponseEntity.status(500).body("Unable to update shop information");
    }
}
