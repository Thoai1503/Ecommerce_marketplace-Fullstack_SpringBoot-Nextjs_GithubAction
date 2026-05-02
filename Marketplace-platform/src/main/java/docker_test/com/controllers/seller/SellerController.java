package docker_test.com.controllers.seller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.PageResult;
import docker_test.com.models.User;
import docker_test.com.repository.SellerRepository;


@RestController
@RequestMapping("/sellers")
public class SellerController {

    private final SellerRepository sellerRepository;

    public SellerController() {
        this.sellerRepository = SellerRepository.Instance();
    }

    /* ================= GET ALL ================= */
    // GET http://localhost:8000/sellers
    @GetMapping("")
    public ResponseEntity<?> getAll() {

        var sellers = sellerRepository.GetAllSellers();
        sellers.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(sellers);
    }

    /* ================= GET BY ID (with stats) ================= */
    // GET http://localhost:8000/sellers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {

        User seller = sellerRepository.GetSellerById(id);

        if (seller == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Seller not found");
        }

        seller.setPasswordHash(null);

        // Load stats cho detail page (products, orders, revenue)
        int    totalProducts = sellerRepository.GetTotalProductsById(id);
        int    totalOrders   = sellerRepository.GetTotalOrdersById(id);
        double revenue       = sellerRepository.GetRevenueById(id);

        Map<String, Object> result = new HashMap<>();
        result.put("seller",        seller);
        result.put("totalProducts", totalProducts);
        result.put("totalOrders",   totalOrders);
        result.put("revenue",       revenue);

        return ResponseEntity.ok(result);
    }

    /* ================= CREATE ================= */
    // POST http://localhost:8000/sellers
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody User req) {

        if (req.getFullName() == null || req.getFullName().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Tên shop không được để trống");
        }

        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email không được để trống");
        }

        try {
            // Đảm bảo đúng userType
            if (req.getUserType() == null
                    || (!req.getUserType().equals("seller") && !req.getUserType().equals("both"))) {
                req.setUserType("seller");
            }

            User created = sellerRepository.Create(req);
            created.setPasswordHash(null);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Tạo seller thất bại");
        }
    }

    /* ================= UPDATE ================= */
    // PUT http://localhost:8000/sellers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable int id,
            @RequestBody User req
    ) {
        User existing = sellerRepository.GetSellerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Seller not found");
        }

        // Chỉ update các field cho phép, không đổi userType qua đây
        existing.setFullName(req.getFullName());
        existing.setPhone(req.getPhone());
        existing.setEmail(req.getEmail());
        existing.setAvatarUrl(req.getAvatarUrl());

        User updated = sellerRepository.Update(existing);

        if (updated == null) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật thất bại");
        }

        updated.setPasswordHash(null);
        return ResponseEntity.ok(updated);
    }

    /* ================= DELETE ================= */
    // DELETE http://localhost:8000/sellers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {

        User existing = sellerRepository.GetSellerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Seller not found");
        }

        boolean deleted = sellerRepository.Delete(id);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Xóa thất bại");
        }

        return ResponseEntity.ok("Deleted successfully");
    }

    /* ================= BLOCK / UNBLOCK ================= */
    // PATCH http://localhost:8000/sellers/{id}/status
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

        User existing = sellerRepository.GetSellerById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Seller not found");
        }

        boolean ok = sellerRepository.setActiveStatus(id, isActive);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật trạng thái thất bại");
        }

        return ResponseEntity.ok(isActive == 1 ? "Shop đã được mở khóa" : "Shop đã bị khóa");
    }

    /* ================= SUMMARY STATS (top cards) ================= */
    // GET http://localhost:8000/sellers/stats
    @GetMapping("/stats")
    public ResponseEntity<?> stats() {

        try {
            long   total   = sellerRepository.CountAll();
            long   active  = sellerRepository.CountActive();
            long   blocked = sellerRepository.CountBlocked();
            double revenue = sellerRepository.TotalRevenue();

            Map<String, Object> result = new HashMap<>();
            result.put("total",   total);
            result.put("active",  active);
            result.put("blocked", blocked);
            result.put("revenue", revenue);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy thống kê");
        }
    }

    /* ================= FILTER + SEARCH + PAGINATE ================= */
    // GET http://localhost:8000/sellers/filter?keyword=rolex&isActive=1&page=1&pageSize=8
    @GetMapping("/filter")
    public ResponseEntity<PageResult<User>> filter(
            @RequestParam(required = false)   String  keyword,
            @RequestParam(required = false)   Integer isActive,
            @RequestParam(defaultValue = "1") int     page,
            @RequestParam(defaultValue = "8") int     pageSize
    ) {
        PageResult<User> result = sellerRepository.Filter(keyword, isActive, page, pageSize);
        result.getData().forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(result);
    }
}
