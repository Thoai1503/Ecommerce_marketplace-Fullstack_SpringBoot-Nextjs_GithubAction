package docker_test.com.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.PageResult;
import docker_test.com.models.User;
import docker_test.com.repository.BuyerRepository;

/**
 * CUSTOMER CONTROLLER
 * Quản lý Khách hàng (Customers screen).
 * userType IN ('buyer', 'shipper')
 */
@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final BuyerRepository buyerRepository;

    public CustomerController() {
        this.buyerRepository = BuyerRepository.Instance();
    }

    /* ================= GET ALL ================= */
    // GET http://localhost:8000/customers
    @GetMapping("")
    public ResponseEntity<?> getAll() {

        var buyers = buyerRepository.GetAllBuyers();
        buyers.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(buyers);
    }

    /* ================= GET BY ID (with stats) ================= */
    // GET http://localhost:8000/customers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {

        User buyer = buyerRepository.GetBuyerById(id);

        if (buyer == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Customer not found");
        }

        buyer.setPasswordHash(null);

        // Load aggregate stats cho detail page
        int    totalOrders   = buyerRepository.GetTotalOrdersById(id);
        double totalSpent    = buyerRepository.GetTotalSpentById(id);
        double avgOrderValue = buyerRepository.GetAvgOrderValueById(id);

        Map<String, Object> result = new HashMap<>();
        result.put("customer",     buyer);
        result.put("totalOrders",  totalOrders);
        result.put("totalSpent",   totalSpent);
        result.put("avgOrderValue", avgOrderValue);

        return ResponseEntity.ok(result);
    }

    /* ================= CREATE ================= */
    // POST http://localhost:8000/customers
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody User req) {

        if (req.getFullName() == null || req.getFullName().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Họ tên không được để trống");
        }

        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email không được để trống");
        }

        try {
            // Đảm bảo đúng userType
            if (req.getUserType() == null
                    || (!req.getUserType().equals("buyer") && !req.getUserType().equals("shipper"))) {
                req.setUserType("buyer");
            }

            User created = buyerRepository.Create(req);
            created.setPasswordHash(null);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Tạo customer thất bại");
        }
    }

    /* ================= UPDATE PROFILE ================= */
    // PUT http://localhost:8000/customers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable int id,
            @RequestBody User req
    ) {
        User existing = buyerRepository.GetBuyerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Customer not found");
        }

        existing.setFullName(req.getFullName());
        existing.setPhone(req.getPhone());
        existing.setAvatarUrl(req.getAvatarUrl());

        // dateOfBirth & gender chỉ set 1 lần
        if (existing.getDateOfBirth() == null) {
            existing.setDateOfBirth(req.getDateOfBirth());
        }

        if (existing.getGender() == null) {
            existing.setGender(req.getGender());
        }

        User updated = buyerRepository.Update(existing);

        if (updated == null) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật thất bại");
        }

        updated.setPasswordHash(null);
        return ResponseEntity.ok(updated);
    }

    /* ================= DELETE ================= */
    // DELETE http://localhost:8000/customers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {

        User existing = buyerRepository.GetBuyerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Customer not found");
        }

        boolean deleted = buyerRepository.Delete(id);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Xóa thất bại");
        }

        return ResponseEntity.ok("Deleted successfully");
    }

    /* ================= BLOCK / UNBLOCK ================= */
    // PATCH http://localhost:8000/customers/{id}/status
    // Body: { "isActive": 0 } hoặc { "isActive": 1 }
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, Integer> body
    ) {
        Integer isActive = body.get("isActive");

        if (isActive == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Thiếu trường isActive");
        }

        if (isActive != 0 && isActive != 1) {
            return ResponseEntity
                    .badRequest()
                    .body("isActive chỉ nhận giá trị 0 hoặc 1");
        }

        User existing = buyerRepository.GetBuyerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Customer not found");
        }

        boolean ok = buyerRepository.setActiveStatus(id, isActive);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật trạng thái thất bại");
        }

        return ResponseEntity.ok(isActive == 1 ? "Tài khoản đã được mở khóa" : "Tài khoản đã bị khóa");
    }

    /* ================= UPDATE NOTE (ghi chú nội bộ) ================= */
    // PATCH http://localhost:8000/customers/{id}/note
    // Body: { "note": "Khách VIP..." }
    @PatchMapping("/{id}/note")
    public ResponseEntity<?> updateNote(
            @PathVariable int id,
            @RequestBody Map<String, String> body
    ) {
        String note = body.get("note");

        User existing = buyerRepository.GetBuyerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Customer not found");
        }

        boolean ok = buyerRepository.UpdateNote(id, note);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật ghi chú thất bại");
        }

        return ResponseEntity.ok("Cập nhật ghi chú thành công");
    }

    /* ================= FILTER + SEARCH + PAGINATE ================= */
    // GET http://localhost:8000/customers/filter?keyword=abc&isActive=1&page=1&pageSize=10
    @GetMapping("/filter")
    public ResponseEntity<PageResult<User>> filter(
            @RequestParam(required = false)    String  keyword,
            @RequestParam(required = false)    Integer isActive,
            @RequestParam(defaultValue = "1")  int     page,
            @RequestParam(defaultValue = "10") int     pageSize
    ) {
        PageResult<User> result = buyerRepository.Filter(keyword, isActive, page, pageSize);
        result.getData().forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(result);
    }
}
