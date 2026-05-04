package docker_test.com.controllers.admin;

import java.sql.SQLException;
import java.time.LocalDateTime;
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
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductImage;
import docker_test.com.repository.ProductImageRepository;
import docker_test.com.repository.ProductRepository;
import docker_test.com.repository.ProductStatusHistoryRepository;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.AuditService;
import docker_test.com.services.FraudDetectionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AdminProductController {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final FraudDetectionService fraudDetectionService;
    private final AuditService auditService;

    public AdminProductController(FraudDetectionService fraudDetectionService, AuditService auditService) {
        this.productRepository = ProductRepository.Instance();
        this.shopRepository = ShopRepository.Instance();
        this.productImageRepository = ProductImageRepository.Instance();
        this.statusHistoryRepository = ProductStatusHistoryRepository.Instance();
        this.userRepository = UserRepository.Instance();
        this.fraudDetectionService = fraudDetectionService;
        this.auditService = auditService;
    }

    private boolean adminProductWritesDisabled() {
        return true;
    }

    // ─── Request body cho POST create ────────────────────────────────────────
    public static class AdminProductCreateRequest {
        public String product_name;
        public String description;
        public Double price;
        public Double original_price;
        public Integer stock_quantity;
        public Integer category_id;
        public Integer shop_id;
        public String status; // APPROVED | PENDING | REJECTED | HIDDEN
        public List<String> images;
    }

    // Persist images for a product: delete old, insert new
    private void saveProductImages(int productId, List<String> imageUrls) {
        if (imageUrls == null) return;
        // Delete existing images
        try {
            java.util.List<ProductImage> existing = productImageRepository.GetByProductId(productId);
            if (existing != null) {
                for (ProductImage img : existing) {
                    productImageRepository.Delete(img.getId());
                }
            }
        } catch (Exception ignore) {}
        // Insert new
        int order = 0;
        for (String url : imageUrls) {
            if (url == null || url.isBlank()) continue;
            ProductImage img = new ProductImage();
            img.setProductId(productId);
            img.setImageUrl(url);
            img.setDisplayOrder(order);
            img.setThumbnail(order == 0 ? 1 : 0);
            try {
                productImageRepository.Create(img);
            } catch (Exception e) {
                System.err.println("[saveProductImages] failed: " + e.getMessage());
            }
            order++;
        }
    }

    // ─── Status constants ────────────────────────────────────────────────────
    // is_active values used to represent product status:
    //   1 = APPROVED (active, visible)
    //   0 = HIDDEN   (inactive, hidden by seller/admin)
    //   2 = PENDING  (awaiting admin approval)
    //   3 = REJECTED (rejected by admin)

    private static String statusFromIsActive(Integer isActive) {
        if (isActive == null) return "PENDING";
        return switch (isActive) {
            case 1 -> "APPROVED";
            case 0 -> "HIDDEN";
            case 3 -> "REJECTED";
            default -> "PENDING"; // 2 or anything else
        };
    }

    private static int isActiveFromStatus(String status) {
        if (status == null) return 2;
        return switch (status.trim().toUpperCase()) {
            case "APPROVED" -> 1;
            case "HIDDEN"   -> 0;
            case "REJECTED" -> 3;
            default         -> 2; // PENDING
        };
    }

    private static String requiredReason(Map<String, Object> body) {
        Object reason = body != null ? body.get("reason") : null;
        return reason != null ? reason.toString().trim() : "";
    }

    private static Long actorIdFrom(Map<String, Object> body, Long headerAdminId) {
        if (headerAdminId != null) return headerAdminId;
        Object bodyActor = body != null ? body.get("changedBy") : null;
        if (bodyActor instanceof Number n) return n.longValue();
        if (bodyActor != null) {
            try { return Long.parseLong(bodyActor.toString()); } catch (Exception ignore) {}
        }
        return 1L;
    }

    private static String actorRoleFrom(Map<String, Object> body, String headerRole) {
        if (headerRole != null && !headerRole.isBlank()) return headerRole.trim().toUpperCase();
        Object bodyRole = body != null ? body.get("changedByRole") : null;
        if (bodyRole != null && !bodyRole.toString().isBlank()) return bodyRole.toString().trim().toUpperCase();
        return "ADMIN";
    }

    private static void clearHideAudit(Product product) {
        product.setHiddenAt(null);
        product.setHiddenBy(null);
        product.setHiddenReason(null);
        product.setHiddenByRole(null);
    }

    private void logStatusChange(Product product, String fromStatus, String toStatus, String reason, Long actorId, String actorRole) {
        statusHistoryRepository.insert(product.getId(), fromStatus, toStatus, reason, actorId, actorRole);
    }

    private void logAudit(Long actorId, String actorRole, String action, int productId, String reason) {
        String details = reason == null || reason.isBlank()
                ? null
                : String.format("{\"reason\":\"%s\"}", reason.replace("\"", "\\\""));
        auditService.logAction(actorId, actorRole, action, "PRODUCT", (long) productId, details);
    }

    private String auditActionForStatus(String status) {
        return switch (status) {
            case "APPROVED" -> "APPROVE_PRODUCT";
            case "REJECTED" -> "REJECT_PRODUCT";
            case "HIDDEN" -> "HIDE_PRODUCT";
            case "PENDING" -> "UNHIDE_PRODUCT";
            default -> "UPDATE_PRODUCT_STATUS";
        };
    }

    private ApiError apiError(HttpStatus status, String error, String message, String path) {
        return new ApiError(status.value(), error, message, path);
    }

    private Map<String, Object> toProductDto(Product p) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", String.valueOf(p.getId()));
        dto.put("name", p.getProduct_name());
        dto.put("sku", p.getProduct_slug());
        dto.put("description", p.getDescription());
        dto.put("price", p.getPrice());
        dto.put("originalPrice", p.getOriginal_price());
        dto.put("stock", p.getStock_quantity());
        dto.put("status", statusFromIsActive(p.getIs_active()));
        dto.put("reject_reason", p.getReject_reason());
        dto.put("rejectReason", p.getReject_reason());
        try {
            String hiddenAt = p.getHiddenAt() != null
                    ? p.getHiddenAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    : null;
            dto.put("hiddenAt", hiddenAt);
            dto.put("hidden_at", hiddenAt);
            dto.put("hiddenBy", p.getHiddenBy());
            dto.put("hidden_by", p.getHiddenBy());
            dto.put("hiddenReason", p.getHiddenReason());
            dto.put("hidden_reason", p.getHiddenReason());
            dto.put("hiddenByRole", p.getHiddenByRole());
            dto.put("hidden_by_role", p.getHiddenByRole());
            if (p.getHiddenBy() != null) {
                User hiddenBy = userRepository.GetById(p.getHiddenBy().intValue());
                dto.put("hiddenByName", hiddenBy != null ? hiddenBy.getFullName() : null);
            } else {
                dto.put("hiddenByName", null);
            }
        } catch (Exception ignore) {}
        dto.put("category", p.getCategory_id() != null ? p.getCategory_id().toString() : null);
        dto.put("sellerId", p.getShop_id() != null ? p.getShop_id().toString() : null);
        dto.put("rating", p.getRating());
        dto.put("reviewCount", p.getReview_count());
        dto.put("soldCount", p.getSold_count());

        // Logistics & brand
        try { dto.put("weight", p.getWeight()); } catch (Exception ignore) {}
        try { dto.put("length", p.getLength()); } catch (Exception ignore) {}
        try { dto.put("width", p.getWidth()); } catch (Exception ignore) {}
        try { dto.put("height", p.getHeight()); } catch (Exception ignore) {}
        try { dto.put("brand", p.getBrand()); } catch (Exception ignore) {}

        // Updated timestamp
        try {
            String updatedAt = p.getUpdated_at() != null
                    ? p.getUpdated_at().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    : null;
            dto.put("updatedAt", updatedAt);
        } catch (Exception ignore) {}

        // Seller name from shop (prefer joined shop_name from listing query)
        String sellerName = p.getShop_name();
        if ((sellerName == null || sellerName.isBlank()) && p.getShop_id() != null && p.getShop_id() > 0) {
            Shop shop = shopRepository.GetById(p.getShop_id());
            sellerName = shop != null ? shop.getShop_name() : "";
        }
        dto.put("sellerName", sellerName != null ? sellerName : "");
        dto.put("shopName", sellerName != null ? sellerName : "");

        // Thumbnail image (first image)
        String imageUrl = p.getImage_url();
        if (imageUrl == null && p.getImages() != null && !p.getImages().isEmpty()) {
            imageUrl = p.getImages().getFirst().getImage_url();
        }
        dto.put("imageUrl", imageUrl);

        // Serialize images as list of {image_url} objects so FE mapper can read img.image_url
        List<Map<String, Object>> imagesDto = new ArrayList<>();
        if (p.getImages() != null) {
            for (ProductImage img : p.getImages()) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", img.getId());
                m.put("image_url", img.getImage_url());
                m.put("display_order", img.getDisplay_order());
                m.put("is_thumbnail", img.getIs_thumbnail());
                imagesDto.add(m);
            }
        }
        dto.put("images", imagesDto);
        dto.put("variants", p.getVariants());

        String createdAt = p.getCreated_at() != null
                ? p.getCreated_at().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null;
        dto.put("createdAt", createdAt);

        return dto;
    }

    // ─── GET /admin/products ─────────────────────────────────────────────────
    // Query params: status, search, page (default 0), size (default 20)
    @GetMapping("")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Product> products = productRepository.GetAll();
        if (products == null) products = new ArrayList<>();

        List<Map<String, Object>> out = new ArrayList<>();

        for (Product p : products) {
            // Filter by status
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                String productStatus = statusFromIsActive(p.getIs_active());
                if (!productStatus.equalsIgnoreCase(status)) continue;
            }

            // Filter by search (name, sku)
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                String name = p.getProduct_name() != null ? p.getProduct_name().toLowerCase() : "";
                String sku  = p.getProduct_slug() != null ? p.getProduct_slug().toLowerCase() : "";
                if (!name.contains(q) && !sku.contains(q)) continue;
            }

            out.add(toProductDto(p));
        }

        // Pagination
        int total = out.size();
        int from  = Math.min(page * size, total);
        int to    = Math.min(from + size, total);
        List<Map<String, Object>> paged = out.subList(from, to);

        Map<String, Object> result = new HashMap<>();
        result.put("data", paged);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", size > 0 ? (int) Math.ceil((double) total / size) : 1);

        return ResponseEntity.ok(result);
    }

    // ─── GET /admin/products/{id} ─────────────────────────────────────────────
    @GetMapping("{id}")
    public ResponseEntity<?> detail(@PathVariable int id) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        return ResponseEntity.ok(toProductDto(product));
    }

    // ─── POST /admin/products ─────────────────────────────────────────────────
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody AdminProductCreateRequest req) {
        if (adminProductWritesDisabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Admin khong duoc tao san pham. Product phai do seller tao va gui duyet.",
                            "code", "ADMIN_PRODUCT_CREATE_DISABLED"));
        }

        // Validate các field bắt buộc
        if (req == null || req.product_name == null || req.product_name.isBlank())
            return ResponseEntity.badRequest().body("product_name is required");
        if (req.price == null || req.price < 0)
            return ResponseEntity.badRequest().body("price is required and must be >= 0");
        if (req.category_id == null)
            return ResponseEntity.badRequest().body("category_id is required");
        if (req.shop_id == null)
            return ResponseEntity.badRequest().body("shop_id is required");

        // Kiểm tra shop tồn tại
        Shop shop = shopRepository.GetById(req.shop_id);
        if (shop == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Shop not found");

        // Tạo slug từ product_name: chuyển thành chữ thường, thay space bằng '-'
        String slug = req.product_name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        // Thêm timestamp để tránh trùng slug
        slug = slug + "-" + System.currentTimeMillis() % 100000;

        Product product = new Product();
        product.setProduct_name(req.product_name);
        product.setProduct_slug(slug);
        product.setDescription(req.description);
        product.setPrice(req.price);
        product.setOriginal_price(req.original_price != null ? req.original_price : req.price);
        product.setStock_quantity(req.stock_quantity != null ? req.stock_quantity : 0);
        product.setCategory_id(req.category_id);
        product.setShop_id(req.shop_id);
        product.setIs_active(isActiveFromStatus(req.status)); // mặc định PENDING (2) nếu null

        try {
            Product created = productRepository.Create(product);
            if (created == null)
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create product failed");

            // Persist images to product_image table
            if (req.images != null && !req.images.isEmpty()) {
                saveProductImages(created.getId(), req.images);
            }

            // Lấy lại từ DB để trả về đầy đủ dữ liệu
            Product full = productRepository.GetById(created.getId());
            if ("PENDING".equals(statusFromIsActive(created.getIs_active()))) {
                fraudDetectionService.analyzeProductAsync(created.getId());
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(toProductDto(full != null ? full : created));

        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create product failed: " + e.getMessage());
        }
    }

    // ─── PATCH /admin/products/{id}/status ───────────────────────────────────
    @PatchMapping("{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id,
                                          @Valid @RequestBody StatusChangeRequestDTO request,
                                          @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
                                          @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        String path = "/admin/products/" + id + "/status";
        String nextStatus = request.getStatus().trim().toUpperCase();
        String reason = request.getReason() != null ? request.getReason().trim() : "";
        if ("HIDDEN".equals(nextStatus) && reason.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "MISSING_REASON", "Lý do là bắt buộc khi ẩn sản phẩm.", path));
        }

        Product product = productRepository.GetById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(apiError(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Không tìm thấy sản phẩm.", path));
        }

        String fromStatus = statusFromIsActive(product.getIs_active());
        Long actorId = actorIdFrom(null, adminId);
        String actorRole = actorRoleFrom(null, adminRole);

        product.setIs_active(isActiveFromStatus(nextStatus));
        if ("HIDDEN".equals(nextStatus)) {
            product.setHiddenAt(LocalDateTime.now());
            product.setHiddenBy(actorId);
            product.setHiddenReason(reason);
            product.setHiddenByRole(actorRole);
        } else if (!"HIDDEN".equals(fromStatus)) {
            clearHideAudit(product);
        }
        Product updated = productRepository.Update(product);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "UPDATE_FAILED", "Cập nhật trạng thái thất bại.", path));
        }
        logStatusChange(updated, fromStatus, nextStatus, reason.isBlank() ? null : reason, actorId, actorRole);
        logAudit(actorId, actorRole, auditActionForStatus(nextStatus), id, reason);
        if ("PENDING".equals(nextStatus)) {
            fraudDetectionService.analyzeProductAsync(id);
        }

        return ResponseEntity.ok(toProductDto(updated));
    }

    @GetMapping("{id}/history")
    public ResponseEntity<?> history(@PathVariable int id) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        return ResponseEntity.ok(Map.of("data", statusHistoryRepository.findByProductId(id)));
    }

    // ─── PATCH /admin/products/{id}/approve ──────────────────────────────────
    @PatchMapping("{id}/approve")
    public ResponseEntity<?> approve(@PathVariable int id,
                                     @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
                                     @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        String fromStatus = statusFromIsActive(product.getIs_active());
        product.setIs_active(1); // APPROVED
        product.setReject_reason(null); // clear any previous rejection reason
        clearHideAudit(product);
        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Approve failed");
        Long actorId = actorIdFrom(null, adminId);
        String actorRole = actorRoleFrom(null, adminRole);
        logStatusChange(updated, fromStatus, "APPROVED", null, actorId, actorRole);
        logAudit(actorId, actorRole, "APPROVE_PRODUCT", id, null);

        return ResponseEntity.ok(toProductDto(updated));
    }

    // ─── PATCH /admin/products/{id}/reject ───────────────────────────────────
    @PatchMapping("{id}/reject")
    public ResponseEntity<?> reject(@PathVariable int id,
                                    @Valid @RequestBody RejectRequestDTO request,
                                    @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
                                    @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
        String path = "/admin/products/" + id + "/reject";
        String reason = request.getReason().trim();

        Product product = productRepository.GetById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(apiError(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Không tìm thấy sản phẩm.", path));
        }

        String fromStatus = statusFromIsActive(product.getIs_active());
        product.setIs_active(3); // REJECTED
        product.setReject_reason(reason);
        clearHideAudit(product);
        Product updated = productRepository.Update(product);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "REJECT_FAILED", "Từ chối sản phẩm thất bại.", path));
        }
        Long actorId = actorIdFrom(null, adminId);
        String actorRole = actorRoleFrom(null, adminRole);
        logStatusChange(updated, fromStatus, "REJECTED", reason, actorId, actorRole);
        logAudit(actorId, actorRole, "REJECT_PRODUCT", id, reason);

        return ResponseEntity.ok(toProductDto(updated));
    }

    // ─── PUT /admin/products/{id} ─────────────────────────────────────────────
    @PutMapping("{id}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> req) {
        if (adminProductWritesDisabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Admin khong duoc sua san pham cua seller. Hay duyet hoac tu choi san pham.",
                            "code", "ADMIN_PRODUCT_UPDATE_DISABLED"));
        }

        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        if (req == null) return ResponseEntity.badRequest().body("Empty body");

        Object productName = req.get("product_name");
        if (productName != null) product.setProduct_name(productName.toString());
        Object description = req.get("description");
        if (description != null) product.setDescription(description.toString());
        Object price = req.get("price");
        if (price != null) product.setPrice(((Number) price).doubleValue());
        Object originalPrice = req.get("original_price");
        if (originalPrice != null) product.setOriginal_price(((Number) originalPrice).doubleValue());
        Object stock = req.get("stock_quantity");
        if (stock != null) product.setStock_quantity(((Number) stock).intValue());
        Object categoryId = req.get("category_id");
        if (categoryId != null) product.setCategory_id(((Number) categoryId).intValue());
        Object isActive = req.get("is_active");
        if (isActive != null) product.setIs_active(((Number) isActive).intValue());

        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update failed");

        // Persist images if provided
        Object imagesObj = req.get("images");
        if (imagesObj instanceof List<?>) {
            List<String> urls = new ArrayList<>();
            for (Object o : (List<?>) imagesObj) {
                if (o instanceof String) urls.add((String) o);
                else if (o instanceof Map) {
                    Object u = ((Map<String, Object>) o).get("image_url");
                    if (u != null) urls.add(u.toString());
                }
            }
            saveProductImages(id, urls);
            updated = productRepository.GetById(id);
        }

        return ResponseEntity.ok(toProductDto(updated));
    }

    // ─── DELETE /admin/products/{id} ─────────────────────────────────────────
    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        if (adminProductWritesDisabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message", "Admin khong duoc xoa san pham cua seller.",
                            "code", "ADMIN_PRODUCT_DELETE_DISABLED"));
        }

        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        product.setIs_active(0); // Soft delete: HIDDEN
        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delete failed");

        return ResponseEntity.ok(true);
    }
}
