package docker_test.com.controllers.admin;

import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.ApiError;
import docker_test.com.dto.admin.RejectRequestDTO;
import docker_test.com.dto.admin.StatusChangeRequestDTO;
import docker_test.com.models.Shop;
import docker_test.com.models.User;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.AuditService;
import docker_test.com.services.EmailService;
import docker_test.com.utils.PasswordUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/admin/sellers")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AdminSellerController {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Autowired
    private EmailService emailService;

    public AdminSellerController(AuditService auditService) {
        this.shopRepository = ShopRepository.Instance();
        this.userRepository = UserRepository.Instance();
        this.auditService = auditService;
    }

    public static class AdminSellerUpsertRequest {
        public String brandTitle;
        public String category;
        public String website;
        public String location;
        public String email;
        public String phone;
        public String logoUrl;
        public String status; // ACTIVE | BLOCKED | PENDING
        public String ownerName;
        public String password; // optional (for create)
    }

    // Dùng trực tiếp cột `status` của bảng shop (PENDING/ACTIVE/REJECTED/BLOCKED)
    private static void applyStatusToEntities(String status, Shop shop, User user) {
        if (status == null) return;
        if (shop != null) shop.setStatus(status);
        // Đồng bộ is_active/is_verified cho các logic khác dùng
        switch (status) {
            case "ACTIVE" -> {
                if (shop != null) { shop.setIs_active(1); shop.setIs_verified(1); }
                if (user != null) user.setIsActive(1);
            }
            case "PENDING" -> {
                if (shop != null) { shop.setIs_active(1); shop.setIs_verified(0); }
                if (user != null) user.setIsActive(1);
            }
            case "BLOCKED", "REJECTED" -> {
                if (shop != null) shop.setIs_active(0);
                if (user != null) user.setIsActive(0);
            }
            default -> { /* ignore unknown */ }
        }
    }

    private Map<String, Object> toSellerDto(Shop shop, User user) {
        String createdAt = shop.getCreated_at() != null
                ? shop.getCreated_at().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null;

        // status lấy trực tiếp từ cột status của DB
        String status = shop.getStatus() != null ? shop.getStatus() : "PENDING";

        String logoUrl = (shop.getShop_logo() != null && !shop.getShop_logo().isBlank())
                ? shop.getShop_logo()
                : "https://ui-avatars.com/api/?name=" + (shop.getShop_name() != null ? shop.getShop_name().replace(" ", "+") : "Seller");

        Map<String, Object> dto = new HashMap<>();
        dto.put("id", String.valueOf(shop.getId()));
        dto.put("accountCode", "SE-" + String.format("%04d", shop.getId()));
        dto.put("brandTitle", shop.getShop_name());
        dto.put("category", shop.getCategory() != null ? shop.getCategory() : "General");
        dto.put("website", shop.getWebsite());
        // shop_description được dùng làm location (chưa có cột riêng)
        dto.put("location", shop.getShop_description() != null ? shop.getShop_description() : "");
        dto.put("email", user != null ? user.getEmail() : "");
        dto.put("phone", user != null ? user.getPhone() : "");
        dto.put("logoUrl", logoUrl);
        dto.put("status", status);
        dto.put("rejection_reason", shop.getRejection_reason());
        dto.put("rejectionReason", shop.getRejection_reason());
        dto.put("block_reason", shop.getBlock_reason());
        dto.put("blockReason", shop.getBlock_reason());
        dto.put("createdAt", createdAt);
        dto.put("ownerName", user != null ? user.getFullName() : "");

        dto.put("totalProducts", shop.getTotal_products());
        dto.put("totalOrders", shop.getTotal_orders());
        // Tính doanh thu thực từ order_item (đơn DELIVERED)
        dto.put("totalRevenue", shopRepository.getTotalRevenue(shop.getId()));
        dto.put("rating", shop.getRating() != null ? shop.getRating() : 0.0);
        // Đếm review thực từ product_review
        dto.put("reviewCount", shopRepository.getReviewCount(shop.getId()));

        return dto;
    }

    private record ShopWithUser(Shop shop, User user) {}

    private ShopWithUser loadShopAndUser(long id) {
        Shop shop = shopRepository.GetById((int) id);
        if (shop == null) return null;
        User user = userRepository.GetById((int) shop.getUser_id());
        return new ShopWithUser(shop, user);
    }

    private ShopWithUser requireShopAndUser(long id) {
        ShopWithUser sw = loadShopAndUser(id);
        return (sw != null && sw.user() != null) ? sw : null;
    }

    private ApiError apiError(HttpStatus status, String error, String message, String path) {
        return new ApiError(status.value(), error, message, path);
    }

    private static Long actorIdFrom(Long headerAdminId) {
        return headerAdminId != null ? headerAdminId : 1L;
    }

    private static String actorRoleFrom(String headerRole) {
        return headerRole != null && !headerRole.isBlank() ? headerRole.trim().toUpperCase() : "ADMIN";
    }

    private void logAudit(Long actorId, String actorRole, String action, long shopId, String reason) {
        String details = reason == null || reason.isBlank()
                ? null
                : String.format("{\"reason\":\"%s\"}", reason.replace("\"", "\\\""));
        auditService.logAction(actorId, actorRole, action, "SHOP", shopId, details);
    }

    /** Persists shop + user. Returns error ResponseEntity on failure, null on success. */
    private ResponseEntity<?> persistAndCheck(ShopWithUser sw, String errorMsg) {
        if (shopRepository.Update(sw.shop()) == null || userRepository.Update(sw.user()) == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMsg);
        }
        sw.user().setPasswordHash(null);
        return null;
    }

    @GetMapping("")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        List<Shop> shops = shopRepository.GetAll();
        List<Map<String, Object>> out = new ArrayList<>();

        for (Shop shop : shops) {
            // Filter by status
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                if (shop.getStatus() == null || !shop.getStatus().equalsIgnoreCase(status)) continue;
            }
            User user = userRepository.GetById((int) shop.getUser_id());
            if (user != null) user.setPasswordHash(null);

            // Filter by search (brandTitle, email, description/location)
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                String name = shop.getShop_name() != null ? shop.getShop_name().toLowerCase() : "";
                String email = user != null && user.getEmail() != null ? user.getEmail().toLowerCase() : "";
                String desc = shop.getShop_description() != null ? shop.getShop_description().toLowerCase() : "";
                if (!name.contains(q) && !email.contains(q) && !desc.contains(q)) continue;
            }

            out.add(toSellerDto(shop, user));
        }

        // Pagination
        int total = out.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        List<Map<String, Object>> paged = out.subList(from, to);

        Map<String, Object> result = new HashMap<>();
        result.put("data", paged);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));

        return ResponseEntity.ok(result);
    }

    @GetMapping("{id}")
    public ResponseEntity<?> detail(@PathVariable long id) {
        ShopWithUser sw = loadShopAndUser(id);
        if (sw == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Seller shop not found");

        if (sw.user() != null) sw.user().setPasswordHash(null);
        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody AdminSellerUpsertRequest req) {
        try {
            if (req == null || req.email == null || req.email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Email là bắt buộc"));
            }

            String normalizedEmail = req.email.trim().toLowerCase();
            if (userRepository.existsByEmail(normalizedEmail)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Email này đã được sử dụng"));
            }

            // Check phone uniqueness (same rule như self-register: 1 phone = 1 seller)
            String normalizedPhone = null;
            if (req.phone != null && !req.phone.isBlank()) {
                normalizedPhone = req.phone.replaceAll("\\s+", "");
                if (normalizedPhone.startsWith("+84")) normalizedPhone = "0" + normalizedPhone.substring(3);
                if (userRepository.existsByPhone(normalizedPhone)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(java.util.Map.of("message", "Số điện thoại này đã được sử dụng"));
                }
            }

            // 1) Create user as seller
            User user = new User();
            user.setEmail(normalizedEmail);
            user.setPhone(normalizedPhone);
            user.setFullName(req.ownerName);
            user.setUserType("seller");
            user.setIsVerified(0);
            user.setIsActive(1);
            user.setAvatarUrl(req.logoUrl);

            String password = (req.password != null && !req.password.isBlank()) ? req.password : "ChangeMe123!";
            user.setPasswordHash(PasswordUtil.hash(password));

            User createdUser = userRepository.Create(user);
            createdUser.setPasswordHash(null);

            // 2) Create shop for that user
            Shop shop = new Shop();
            shop.setUser_id(createdUser.getId());
            shop.setShop_name(req.brandTitle != null ? req.brandTitle : createdUser.getFullName());
            shop.setShop_description(req.location);
            shop.setShop_logo(req.logoUrl);
            shop.setCategory(req.category);
            shop.setWebsite(req.website);

            applyStatusToEntities(req.status, shop, createdUser);

            Shop createdShop = shopRepository.Create(shop);
            if (createdShop == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("message", "Không tạo được shop"));
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(toSellerDto(createdShop, createdUser));

        } catch (Exception e) {
            // Last-resort: dịch SQL unique constraint thành message dễ hiểu
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("Duplicate entry") && msg.contains("user.phone")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Số điện thoại này đã được sử dụng"));
            }
            if (msg.contains("Duplicate entry") && msg.contains("user.email")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Email này đã được sử dụng"));
            }
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Tạo nhà bán hàng thất bại. Vui lòng thử lại."));
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> update(@PathVariable long id, @RequestBody AdminSellerUpsertRequest req) {
        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Seller not found");

        if (req.brandTitle != null) sw.shop().setShop_name(req.brandTitle);
        if (req.location != null) sw.shop().setShop_description(req.location);
        if (req.logoUrl != null) sw.shop().setShop_logo(req.logoUrl);
        if (req.category != null) sw.shop().setCategory(req.category);
        if (req.website != null) sw.shop().setWebsite(req.website);

        // Email uniqueness khi admin đổi email
        if (req.email != null && !req.email.equalsIgnoreCase(sw.user().getEmail())) {
            if (userRepository.existsByEmail(req.email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Email này đã được sử dụng bởi tài khoản khác"));
            }
            sw.user().setEmail(req.email);
        }

        // Phone uniqueness khi admin đổi phone
        if (req.phone != null && !req.phone.isBlank()) {
            String normalizedPhone = req.phone.replaceAll("\\s+", "");
            if (normalizedPhone.startsWith("+84")) normalizedPhone = "0" + normalizedPhone.substring(3);
            if (!normalizedPhone.equals(sw.user().getPhone())) {
                if (userRepository.existsByPhone(normalizedPhone)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(java.util.Map.of("message", "Số điện thoại này đã được sử dụng bởi tài khoản khác"));
                }
                sw.user().setPhone(normalizedPhone);
            }
        }
        if (req.ownerName != null) sw.user().setFullName(req.ownerName);

        applyStatusToEntities(req.status, sw.shop(), sw.user());

        ResponseEntity<?> err = persistAndCheck(sw, "Update failed");
        if (err != null) return err;
        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    // PATCH /admin/sellers/{id}/status — đổi status (ACTIVE/BLOCKED/PENDING)
    @PatchMapping("{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable long id,
            @Valid @RequestBody StatusChangeRequestDTO request) {
        String path = "/admin/sellers/" + id + "/status";

        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(apiError(HttpStatus.NOT_FOUND, "SELLER_NOT_FOUND", "Không tìm thấy nhà bán hàng.", path));
        }

        applyStatusToEntities(request.getStatus().trim().toUpperCase(), sw.shop(), sw.user());

        ResponseEntity<?> err = persistAndCheck(sw, "Update failed");
        if (err != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "UPDATE_FAILED", "Cập nhật trạng thái nhà bán hàng thất bại.", path));
        }
        return ResponseEntity.ok(true);
    }

    // PATCH /admin/sellers/{id}/approve — duyệt seller PENDING → ACTIVE
    @PatchMapping("{id}/approve")
    public ResponseEntity<?> approve(@PathVariable long id,
                                     @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
                                     @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Seller not found");

        applyStatusToEntities("ACTIVE", sw.shop(), sw.user());
        sw.shop().setRejection_reason(null);

        ResponseEntity<?> err = persistAndCheck(sw, "Approve failed");
        if (err != null) return err;

        // Gửi email thông báo (không block response nếu lỗi)
        try {
            String shopName = sw.shop().getShop_name() != null ? sw.shop().getShop_name()
                    : (sw.user().getFullName() != null ? sw.user().getFullName() : sw.user().getEmail());
            emailService.sendShopApprovedEmail(sw.user().getEmail(), shopName);
        } catch (Exception mailEx) {
            System.err.println("[AdminSellerController] Send approved email failed: " + mailEx.getMessage());
        }
        logAudit(actorIdFrom(adminId), actorRoleFrom(adminRole), "APPROVE_SHOP", id, null);

        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    // PATCH /admin/sellers/{id}/reject — từ chối seller PENDING → REJECTED (kèm lý do)
    @PatchMapping("{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable long id,
            @Valid @RequestBody RejectRequestDTO request,
            @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        String path = "/admin/sellers/" + id + "/reject";
        String reason = request.getReason().trim();

        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(apiError(HttpStatus.NOT_FOUND, "SELLER_NOT_FOUND", "Không tìm thấy nhà bán hàng.", path));
        }

        applyStatusToEntities("REJECTED", sw.shop(), sw.user());
        sw.shop().setRejection_reason(reason);

        ResponseEntity<?> err = persistAndCheck(sw, "Reject failed");
        if (err != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "REJECT_FAILED", "Từ chối nhà bán hàng thất bại.", path));
        }

        // Gửi email thông báo kèm lý do (không block response nếu lỗi)
        try {
            String shopName = sw.shop().getShop_name() != null ? sw.shop().getShop_name()
                    : (sw.user().getFullName() != null ? sw.user().getFullName() : sw.user().getEmail());
            emailService.sendShopRejectedEmail(sw.user().getEmail(), shopName, reason);
        } catch (Exception mailEx) {
            System.err.println("[AdminSellerController] Send rejected email failed: " + mailEx.getMessage());
        }
        logAudit(actorIdFrom(adminId), actorRoleFrom(adminRole), "REJECT_SHOP", id, reason);

        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    // PATCH /admin/sellers/{id}/reopen — cho phép REJECTED seller đăng ký lại (REJECTED → PENDING, clear reason)
    @PatchMapping("{id}/reopen")
    public ResponseEntity<?> reopen(@PathVariable long id) {
        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Seller not found");

        if (!"REJECTED".equalsIgnoreCase(sw.shop().getStatus())) {
            return ResponseEntity.badRequest().body("Only REJECTED sellers can be reopened");
        }

        applyStatusToEntities("PENDING", sw.shop(), sw.user());
        sw.shop().setRejection_reason(null);

        ResponseEntity<?> err = persistAndCheck(sw, "Reopen failed");
        if (err != null) return err;
        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    // PATCH /admin/sellers/{id}/block — khóa shop kèm lý do
    @PatchMapping("{id}/block")
    public ResponseEntity<?> block(
            @PathVariable long id,
            @Valid @RequestBody RejectRequestDTO request,
            @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        String path = "/admin/sellers/" + id + "/block";
        String reason = request.getReason().trim();

        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(apiError(HttpStatus.NOT_FOUND, "SELLER_NOT_FOUND", "Không tìm thấy nhà bán hàng.", path));
        }

        applyStatusToEntities("BLOCKED", sw.shop(), sw.user());
        sw.shop().setBlock_reason(reason);

        ResponseEntity<?> err = persistAndCheck(sw, "Block failed");
        if (err != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "BLOCK_FAILED", "Khóa nhà bán hàng thất bại.", path));
        }

        try {
            String shopName = sw.shop().getShop_name() != null ? sw.shop().getShop_name()
                    : (sw.user().getFullName() != null ? sw.user().getFullName() : sw.user().getEmail());
            emailService.sendShopBlockedEmail(sw.user().getEmail(), shopName, reason);
        } catch (Exception mailEx) {
            System.err.println("[AdminSellerController] Send blocked email failed: " + mailEx.getMessage());
        }
        logAudit(actorIdFrom(adminId), actorRoleFrom(adminRole), "BLOCK_SHOP", id, reason);

        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    // PATCH /admin/sellers/{id}/unblock — mở khóa shop → ACTIVE
    @PatchMapping("{id}/unblock")
    public ResponseEntity<?> unblock(@PathVariable long id,
                                     @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
                                     @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Seller not found");

        applyStatusToEntities("ACTIVE", sw.shop(), sw.user());
        sw.shop().setBlock_reason(null);

        ResponseEntity<?> err = persistAndCheck(sw, "Unblock failed");
        if (err != null) return err;
        logAudit(actorIdFrom(adminId), actorRoleFrom(adminRole), "UNBLOCK_SHOP", id, null);
        return ResponseEntity.ok(toSellerDto(sw.shop(), sw.user()));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable long id) {
        // Soft delete: mark blocked/inactive
        ShopWithUser sw = requireShopAndUser(id);
        if (sw == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Seller not found");

        applyStatusToEntities("BLOCKED", sw.shop(), sw.user());

        ResponseEntity<?> err = persistAndCheck(sw, "Delete (soft) failed");
        if (err != null) return err;
        return ResponseEntity.ok(true);
    }
}

