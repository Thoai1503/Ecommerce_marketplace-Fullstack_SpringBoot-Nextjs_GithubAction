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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.Shop;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductImage;
import docker_test.com.repository.ProductImageRepository;
import docker_test.com.repository.ProductRepository;
import docker_test.com.repository.ShopRepository;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminProductController {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final ProductImageRepository productImageRepository;

    public AdminProductController() {
        this.productRepository = ProductRepository.Instance();
        this.shopRepository = ShopRepository.Instance();
        this.productImageRepository = ProductImageRepository.Instance();
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
        return switch (status) {
            case "APPROVED" -> 1;
            case "HIDDEN"   -> 0;
            case "REJECTED" -> 3;
            default         -> 2; // PENDING
        };
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
        dto.put("category", p.getCategory_id() != null ? p.getCategory_id().toString() : null);
        dto.put("sellerId", p.getShop_id() != null ? p.getShop_id().toString() : null);
        dto.put("rating", p.getRating());
        dto.put("reviewCount", p.getReview_count());
        dto.put("soldCount", p.getSold_count());

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
            return ResponseEntity.status(HttpStatus.CREATED).body(toProductDto(full != null ? full : created));

        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create product failed: " + e.getMessage());
        }
    }

    // ─── PATCH /admin/products/{id}/status ───────────────────────────────────
    @PatchMapping("{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody Map<String, Object> body) {
        Object s = body != null ? body.get("status") : null;
        if (s == null) return ResponseEntity.badRequest().body("status is required");

        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        product.setIs_active(isActiveFromStatus(s.toString()));
        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update failed");

        return ResponseEntity.ok(toProductDto(updated));
    }

    // ─── PATCH /admin/products/{id}/approve ──────────────────────────────────
    @PatchMapping("{id}/approve")
    public ResponseEntity<?> approve(@PathVariable int id) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        product.setIs_active(1); // APPROVED
        product.setReject_reason(null); // clear any previous rejection reason
        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Approve failed");

        return ResponseEntity.ok(toProductDto(updated));
    }

    // ─── PATCH /admin/products/{id}/reject ───────────────────────────────────
    @PatchMapping("{id}/reject")
    public ResponseEntity<?> reject(@PathVariable int id,
                                    @RequestBody(required = false) Map<String, Object> body) {
        String reason = body != null ? (String) body.get("reason") : null;
        if (reason == null || reason.isBlank())
            return ResponseEntity.badRequest().body("reason is required");

        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        product.setIs_active(3); // REJECTED
        product.setReject_reason(reason);
        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reject failed");

        return ResponseEntity.ok(toProductDto(updated));
    }

    // ─── PUT /admin/products/{id} ─────────────────────────────────────────────
    @PutMapping("{id}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> req) {
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
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        product.setIs_active(0); // Soft delete: HIDDEN
        Product updated = productRepository.Update(product);
        if (updated == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delete failed");

        return ResponseEntity.ok(true);
    }
}
