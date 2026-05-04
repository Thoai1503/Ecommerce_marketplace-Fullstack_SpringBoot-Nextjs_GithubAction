package docker_test.com.controllers.seller;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Shop;
import docker_test.com.repository.ShopRepository;

@RestController("sellerProductsController")
@RequestMapping("/seller/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class SellerProductController {

    private static final int STATUS_HIDDEN = 0;
    private static final int STATUS_APPROVED = 1;
    private static final int STATUS_PENDING = 2;
    private static final int STATUS_REJECTED = 3;

    private final DBConnection dbConnection;
    private final ShopRepository shopRepository;

    public SellerProductController() {
        this.dbConnection = DBConnection.getInstance();
        this.shopRepository = ShopRepository.Instance();
    }

    public static class SellerProductRequest {
        public String name;
        public String product_name;
        public String description;
        public Integer categoryId;
        public Integer category_id;
        public Double price;
        public Double originalPrice;
        public Double original_price;
        public Integer stock;
        public Integer stock_quantity;
        public Double weight;
        public Double length;
        public Double width;
        public Double height;
        public List<Object> images;
    }

    private record AuthContext(int userId, int shopId, String shopName) {}

    private static class ProductSnapshot {
        int id;
        int shopId;
        Integer categoryId;
        String categoryName;
        String productName;
        String slug;
        String description;
        Double price;
        Double originalPrice;
        Integer stock;
        Double weight;
        Double length;
        Double width;
        Double height;
        Integer isActive;
        String rejectReason;
        String shopName;
        Timestamp createdAt;
        Timestamp updatedAt;
    }

    @GetMapping("")
    public ResponseEntity<?> list(
            @CookieValue(value = "user", required = false) String userCookie,
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        AuthContext auth = currentSeller(userCookie, userHeader);
        if (auth == null) return unauthorizedSeller();

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        int offset = safePage * safeSize;

        List<Object> whereParams = new ArrayList<>();
        StringBuilder where = new StringBuilder("p.shop_id = ?");
        whereParams.add(auth.shopId());

        Integer statusValue = isActiveFromStatus(status);
        if (statusValue != null) {
            where.append(" AND p.is_active = ?");
            whereParams.add(statusValue);
        }

        if (search != null && !search.isBlank()) {
            where.append(" AND (LOWER(p.product_name) LIKE ? OR LOWER(p.product_slug) LIKE ?)");
            String q = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            whereParams.add(q);
            whereParams.add(q);
        }

        if (categoryId != null) {
            where.append(" AND p.category_id = ?");
            whereParams.add(categoryId);
        }

        try (Connection con = dbConnection.getConn()) {
            int total = countProducts(con, where.toString(), whereParams);
            List<Map<String, Object>> data = new ArrayList<>();

            String sql = """
                SELECT
                    p.id, p.shop_id, p.category_id, p.product_name, p.product_slug,
                    p.description, p.price, p.original_price, p.stock_quantity,
                    p.weight, p.length, p.width, p.height,
                    p.is_active, p.reject_reason, p.created_at, p.updated_at,
                    s.shop_name,
                    c.category_name
                FROM product p
                LEFT JOIN shop s ON s.id = p.shop_id
                LEFT JOIN category c ON c.id = p.category_id
                WHERE %s
                ORDER BY p.id DESC
                LIMIT ? OFFSET ?
                """.formatted(where);

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                int index = bindParams(ps, whereParams, 1);
                ps.setInt(index++, safeSize);
                ps.setInt(index, offset);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        data.add(toDto(con, fromResultSet(rs)));
                    }
                }
            }

            Map<String, Object> meta = new LinkedHashMap<>();
            meta.put("page", safePage);
            meta.put("size", safeSize);
            meta.put("total", total);
            meta.put("totalPages", safeSize > 0 ? (int) Math.ceil((double) total / safeSize) : 1);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("data", data);
            body.put("message", "Lay danh sach san pham thanh cong");
            body.put("meta", meta);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return serverError("Khong the lay danh sach san pham", e);
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<?> detail(
            @CookieValue(value = "user", required = false) String userCookie,
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @PathVariable int id) {

        AuthContext auth = currentSeller(userCookie, userHeader);
        if (auth == null) return unauthorizedSeller();

        try (Connection con = dbConnection.getConn()) {
            ProductSnapshot product = readOwnedProduct(con, id, auth.shopId());
            if (product == null) return error(HttpStatus.NOT_FOUND, "Khong tim thay san pham", "PRODUCT_NOT_FOUND");
            return ResponseEntity.ok(envelope(toDto(con, product), "Lay chi tiet san pham thanh cong"));
        } catch (Exception e) {
            return serverError("Khong the lay chi tiet san pham", e);
        }
    }

    @PostMapping("")
    public ResponseEntity<?> create(
            @CookieValue(value = "user", required = false) String userCookie,
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @RequestBody SellerProductRequest req) {

        AuthContext auth = currentSeller(userCookie, userHeader);
        if (auth == null) return unauthorizedSeller();

        Map<String, String> errors = validate(req, false);
        if (!errors.isEmpty()) return validationError(errors);

        try (Connection con = dbConnection.getConn()) {
            if (!categoryExists(con, categoryId(req))) {
                errors.put("categoryId", "Danh muc khong hop le");
                return validationError(errors);
            }

            String sql = """
                INSERT INTO product
                    (shop_id, category_id, description, product_name, product_slug,
                     price, original_price, stock_quantity, weight, length, width, height,
                     is_active, reject_reason, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())
                """;

            int productId;
            try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, auth.shopId());
                ps.setInt(2, categoryId(req));
                ps.setString(3, blankToNull(req.description));
                ps.setString(4, productName(req));
                ps.setString(5, buildSlug(productName(req)));
                ps.setDouble(6, req.price);
                ps.setDouble(7, originalPrice(req));
                ps.setInt(8, stock(req));
                ps.setObject(9, req.weight);
                ps.setObject(10, req.length);
                ps.setObject(11, req.width);
                ps.setObject(12, req.height);
                ps.setInt(13, STATUS_PENDING);

                int rows = ps.executeUpdate();
                if (rows == 0) return error(HttpStatus.BAD_REQUEST, "Tao san pham that bai", "CREATE_FAILED");

                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (!keys.next()) return error(HttpStatus.BAD_REQUEST, "Khong lay duoc product id", "CREATE_FAILED");
                    productId = keys.getInt(1);
                }
            }

            saveImages(con, productId, imageUrls(req.images));
            ProductSnapshot created = readOwnedProduct(con, productId, auth.shopId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(envelope(toDto(con, created), "Da gui san pham cho admin duyet"));
        } catch (Exception e) {
            return serverError("Khong the tao san pham", e);
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> update(
            @CookieValue(value = "user", required = false) String userCookie,
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @PathVariable int id,
            @RequestBody SellerProductRequest req) {

        AuthContext auth = currentSeller(userCookie, userHeader);
        if (auth == null) return unauthorizedSeller();

        try (Connection con = dbConnection.getConn()) {
            ProductSnapshot existing = readOwnedProduct(con, id, auth.shopId());
            if (existing == null) return error(HttpStatus.NOT_FOUND, "Khong tim thay san pham", "PRODUCT_NOT_FOUND");
            if (existing.isActive != STATUS_PENDING && existing.isActive != STATUS_REJECTED) {
                return error(HttpStatus.BAD_REQUEST,
                        "Khong the sua san pham da duoc duyet hoac da an",
                        "INVALID_STATUS_TRANSITION");
            }

            SellerProductRequest merged = merge(existing, req);
            Map<String, String> errors = validate(merged, true);
            if (!errors.isEmpty()) return validationError(errors);
            if (!categoryExists(con, categoryId(merged))) {
                errors.put("categoryId", "Danh muc khong hop le");
                return validationError(errors);
            }

            String sql = """
                UPDATE product SET
                    category_id = ?,
                    description = ?,
                    product_name = ?,
                    price = ?,
                    original_price = ?,
                    stock_quantity = ?,
                    weight = ?,
                    length = ?,
                    width = ?,
                    height = ?,
                    updated_at = NOW()
                WHERE id = ? AND shop_id = ?
                """;

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setInt(1, categoryId(merged));
                ps.setString(2, blankToNull(merged.description));
                ps.setString(3, productName(merged));
                ps.setDouble(4, merged.price);
                ps.setDouble(5, originalPrice(merged));
                ps.setInt(6, stock(merged));
                ps.setObject(7, merged.weight);
                ps.setObject(8, merged.length);
                ps.setObject(9, merged.width);
                ps.setObject(10, merged.height);
                ps.setInt(11, id);
                ps.setInt(12, auth.shopId());
                if (ps.executeUpdate() == 0) {
                    return error(HttpStatus.BAD_REQUEST, "Cap nhat san pham that bai", "UPDATE_FAILED");
                }
            }

            if (req != null && req.images != null) {
                saveImages(con, id, imageUrls(req.images));
            }

            ProductSnapshot updated = readOwnedProduct(con, id, auth.shopId());
            return ResponseEntity.ok(envelope(toDto(con, updated), "Cap nhat san pham thanh cong"));
        } catch (Exception e) {
            return serverError("Khong the cap nhat san pham", e);
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(
            @CookieValue(value = "user", required = false) String userCookie,
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @PathVariable int id) {

        AuthContext auth = currentSeller(userCookie, userHeader);
        if (auth == null) return unauthorizedSeller();

        try (Connection con = dbConnection.getConn()) {
            ProductSnapshot existing = readOwnedProduct(con, id, auth.shopId());
            if (existing == null) return error(HttpStatus.NOT_FOUND, "Khong tim thay san pham", "PRODUCT_NOT_FOUND");
            if (existing.isActive == STATUS_APPROVED) {
                return error(HttpStatus.BAD_REQUEST,
                        "Khong the xoa san pham da duoc duyet",
                        "INVALID_STATUS_TRANSITION");
            }

            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE product SET is_active = ?, updated_at = NOW() WHERE id = ? AND shop_id = ?")) {
                ps.setInt(1, STATUS_HIDDEN);
                ps.setInt(2, id);
                ps.setInt(3, auth.shopId());
                ps.executeUpdate();
            }

            return ResponseEntity.ok(envelope(true, "Da an san pham thanh cong"));
        } catch (Exception e) {
            return serverError("Khong the xoa san pham", e);
        }
    }

    @PostMapping("{id}/resubmit")
    public ResponseEntity<?> resubmit(
            @CookieValue(value = "user", required = false) String userCookie,
            @RequestHeader(value = "X-User-Id", required = false) String userHeader,
            @PathVariable int id) {

        AuthContext auth = currentSeller(userCookie, userHeader);
        if (auth == null) return unauthorizedSeller();

        try (Connection con = dbConnection.getConn()) {
            ProductSnapshot existing = readOwnedProduct(con, id, auth.shopId());
            if (existing == null) return error(HttpStatus.NOT_FOUND, "Khong tim thay san pham", "PRODUCT_NOT_FOUND");
            if (existing.isActive != STATUS_REJECTED) {
                return error(HttpStatus.BAD_REQUEST,
                        "Chi san pham bi tu choi moi gui duyet lai duoc",
                        "INVALID_STATUS_TRANSITION");
            }

            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE product SET is_active = ?, reject_reason = NULL, updated_at = NOW() WHERE id = ? AND shop_id = ?")) {
                ps.setInt(1, STATUS_PENDING);
                ps.setInt(2, id);
                ps.setInt(3, auth.shopId());
                ps.executeUpdate();
            }

            ProductSnapshot updated = readOwnedProduct(con, id, auth.shopId());
            return ResponseEntity.ok(envelope(toDto(con, updated), "Da gui duyet lai, cho admin xem xet"));
        } catch (Exception e) {
            return serverError("Khong the gui duyet lai", e);
        }
    }

    private AuthContext currentSeller(String userCookie, String userHeader) {
        Integer userId = parseInt(userCookie);
        if (userId == null) userId = parseInt(userHeader);
        if (userId == null) return null;

        Shop shop = shopRepository.GetByUserId(userId);
        if (shop == null || shop.getId() <= 0) return null;
        return new AuthContext(userId, (int) shop.getId(), shop.getShop_name());
    }

    private ResponseEntity<?> unauthorizedSeller() {
        return error(HttpStatus.UNAUTHORIZED,
                "Ban can dang nhap bang tai khoan seller co shop hop le",
                "SELLER_AUTH_REQUIRED");
    }

    private ProductSnapshot readOwnedProduct(Connection con, int productId, int shopId) throws Exception {
        String sql = """
            SELECT
                p.id, p.shop_id, p.category_id, p.product_name, p.product_slug,
                p.description, p.price, p.original_price, p.stock_quantity,
                p.weight, p.length, p.width, p.height,
                p.is_active, p.reject_reason, p.created_at, p.updated_at,
                s.shop_name,
                c.category_name
            FROM product p
            LEFT JOIN shop s ON s.id = p.shop_id
            LEFT JOIN category c ON c.id = p.category_id
            WHERE p.id = ? AND p.shop_id = ?
            """;
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            ps.setInt(2, shopId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return fromResultSet(rs);
            }
        }
        return null;
    }

    private int countProducts(Connection con, String where, List<Object> params) throws Exception {
        try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM product p WHERE " + where)) {
            bindParams(ps, params, 1);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    private ProductSnapshot fromResultSet(ResultSet rs) throws Exception {
        ProductSnapshot p = new ProductSnapshot();
        p.id = rs.getInt("id");
        p.shopId = rs.getInt("shop_id");
        p.categoryId = intOrNull(rs, "category_id");
        p.categoryName = rs.getString("category_name");
        p.productName = rs.getString("product_name");
        p.slug = rs.getString("product_slug");
        p.description = rs.getString("description");
        p.price = doubleOrNull(rs, "price");
        p.originalPrice = doubleOrNull(rs, "original_price");
        p.stock = intOrNull(rs, "stock_quantity");
        p.weight = doubleOrNull(rs, "weight");
        p.length = doubleOrNull(rs, "length");
        p.width = doubleOrNull(rs, "width");
        p.height = doubleOrNull(rs, "height");
        p.isActive = intOrNull(rs, "is_active");
        p.rejectReason = rs.getString("reject_reason");
        p.shopName = rs.getString("shop_name");
        p.createdAt = rs.getTimestamp("created_at");
        p.updatedAt = rs.getTimestamp("updated_at");
        return p;
    }

    private Map<String, Object> toDto(Connection con, ProductSnapshot p) throws Exception {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", p.id);
        dto.put("name", p.productName);
        dto.put("productName", p.productName);
        dto.put("slug", p.slug);
        dto.put("sku", p.slug);
        dto.put("description", p.description);
        dto.put("categoryId", p.categoryId);
        dto.put("categoryName", p.categoryName);
        dto.put("price", p.price != null ? p.price : 0);
        dto.put("originalPrice", p.originalPrice != null ? p.originalPrice : p.price);
        dto.put("stock", p.stock != null ? p.stock : 0);
        dto.put("weight", p.weight);
        dto.put("length", p.length);
        dto.put("width", p.width);
        dto.put("height", p.height);
        dto.put("status", statusFromIsActive(p.isActive));
        dto.put("isActive", p.isActive);
        dto.put("rejectReason", p.rejectReason);
        dto.put("reject_reason", p.rejectReason);
        dto.put("images", getImages(con, p.id));
        dto.put("variants", getVariants(con, p.id));
        dto.put("shopId", p.shopId);
        dto.put("shopName", p.shopName);
        dto.put("sellerId", String.valueOf(p.shopId));
        dto.put("sellerName", p.shopName);
        dto.put("createdAt", formatTimestamp(p.createdAt));
        dto.put("updatedAt", formatTimestamp(p.updatedAt));
        return dto;
    }

    private List<String> getImages(Connection con, int productId) throws Exception {
        List<String> images = new ArrayList<>();
        String sql = """
            SELECT image_url
            FROM product_image
            WHERE product_id = ?
            ORDER BY display_order ASC, id ASC
            """;
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String url = rs.getString("image_url");
                    if (url != null && !url.isBlank()) images.add(url);
                }
            }
        }
        return images;
    }

    private List<Map<String, Object>> getVariants(Connection con, int productId) throws Exception {
        List<Map<String, Object>> variants = new ArrayList<>();
        String sql = """
            SELECT id, sku, variant_name, price, stock_quantity, image_url, is_active
            FROM product_variant
            WHERE product_id = ? AND COALESCE(is_active, 1) = 1
            ORDER BY id ASC
            """;
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> v = new LinkedHashMap<>();
                    v.put("id", rs.getInt("id"));
                    v.put("sku", rs.getString("sku"));
                    v.put("name", rs.getString("variant_name"));
                    v.put("price", doubleOrNull(rs, "price"));
                    v.put("stock", intOrNull(rs, "stock_quantity"));
                    v.put("imageUrl", rs.getString("image_url"));
                    v.put("isActive", intOrNull(rs, "is_active"));
                    variants.add(v);
                }
            }
        } catch (Exception ignore) {
            return variants;
        }
        return variants;
    }

    private void saveImages(Connection con, int productId, List<String> urls) throws Exception {
        try (PreparedStatement ps = con.prepareStatement("DELETE FROM product_image WHERE product_id = ?")) {
            ps.setInt(1, productId);
            ps.executeUpdate();
        }

        String sql = """
            INSERT INTO product_image (product_id, image_url, display_order, is_thumbnail)
            VALUES (?, ?, ?, ?)
            """;
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            int order = 0;
            for (String url : urls) {
                if (url == null || url.isBlank()) continue;
                ps.setInt(1, productId);
                ps.setString(2, url.trim());
                ps.setInt(3, order);
                ps.setInt(4, order == 0 ? 1 : 0);
                ps.addBatch();
                order++;
            }
            ps.executeBatch();
        }
    }

    private boolean categoryExists(Connection con, Integer categoryId) throws Exception {
        if (categoryId == null) return false;
        try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM category WHERE id = ?")) {
            ps.setInt(1, categoryId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        }
    }

    private Map<String, String> validate(SellerProductRequest req, boolean update) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (req == null) {
            errors.put("body", "Du lieu san pham la bat buoc");
            return errors;
        }

        String name = productName(req);
        if (name == null || name.isBlank()) {
            errors.put("name", "Ten san pham la bat buoc");
        } else if (name.trim().length() < 3 || name.trim().length() > 100) {
            errors.put("name", "Ten san pham phai tu 3 den 100 ky tu");
        }

        if (categoryId(req) == null) {
            errors.put("categoryId", "Danh muc la bat buoc");
        }

        if (req.price == null || req.price < 1000) {
            errors.put("price", "Gia ban phai lon hon hoac bang 1000");
        }

        Double original = originalPrice(req);
        if (original == null || original < 1000) {
            errors.put("originalPrice", "Gia goc phai lon hon hoac bang 1000");
        } else if (req.price != null && original < req.price) {
            errors.put("originalPrice", "Gia goc phai lon hon hoac bang gia ban");
        }

        Integer stock = stock(req);
        if (stock == null || stock < 0) {
            errors.put("stock", "Ton kho phai lon hon hoac bang 0");
        }

        return errors;
    }

    private SellerProductRequest merge(ProductSnapshot existing, SellerProductRequest req) {
        SellerProductRequest out = new SellerProductRequest();
        out.name = req != null && productName(req) != null ? productName(req) : existing.productName;
        out.description = req != null && req.description != null ? req.description : existing.description;
        out.categoryId = req != null && categoryId(req) != null ? categoryId(req) : existing.categoryId;
        out.price = req != null && req.price != null ? req.price : existing.price;
        out.originalPrice = req != null && originalPrice(req) != null ? originalPrice(req) : existing.originalPrice;
        out.stock = req != null && stock(req) != null ? stock(req) : existing.stock;
        out.weight = req != null && req.weight != null ? req.weight : existing.weight;
        out.length = req != null && req.length != null ? req.length : existing.length;
        out.width = req != null && req.width != null ? req.width : existing.width;
        out.height = req != null && req.height != null ? req.height : existing.height;
        return out;
    }

    private static String productName(SellerProductRequest req) {
        if (req == null) return null;
        return req.name != null ? req.name : req.product_name;
    }

    private static Integer categoryId(SellerProductRequest req) {
        if (req == null) return null;
        return req.categoryId != null ? req.categoryId : req.category_id;
    }

    private static Double originalPrice(SellerProductRequest req) {
        if (req == null) return null;
        if (req.originalPrice != null) return req.originalPrice;
        if (req.original_price != null) return req.original_price;
        return req.price;
    }

    private static Integer stock(SellerProductRequest req) {
        if (req == null) return null;
        if (req.stock != null) return req.stock;
        if (req.stock_quantity != null) return req.stock_quantity;
        return 0;
    }

    private List<String> imageUrls(List<Object> images) {
        List<String> urls = new ArrayList<>();
        if (images == null) return urls;

        for (Object image : images) {
            if (image instanceof String s) {
                if (!s.isBlank()) urls.add(s.trim());
            } else if (image instanceof Map<?, ?> m) {
                Object url = firstPresent(m, "url", "imageUrl", "image_url");
                if (url != null && !url.toString().isBlank()) urls.add(url.toString().trim());
            }
        }
        return urls;
    }

    private static Object firstPresent(Map<?, ?> map, String... keys) {
        for (String key : keys) {
            if (map.containsKey(key)) return map.get(key);
        }
        return null;
    }

    private static Integer isActiveFromStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) return null;
        return switch (status.trim().toUpperCase(Locale.ROOT)) {
            case "APPROVED", "ACTIVE" -> STATUS_APPROVED;
            case "HIDDEN", "INACTIVE", "DRAFT" -> STATUS_HIDDEN;
            case "REJECTED" -> STATUS_REJECTED;
            case "PENDING", "PENDING_APPROVAL" -> STATUS_PENDING;
            default -> null;
        };
    }

    private static String statusFromIsActive(Integer isActive) {
        if (isActive == null) return "PENDING";
        return switch (isActive) {
            case STATUS_APPROVED -> "APPROVED";
            case STATUS_HIDDEN -> "HIDDEN";
            case STATUS_REJECTED -> "REJECTED";
            default -> "PENDING";
        };
    }

    private static String buildSlug(String raw) {
        String normalized = Normalizer.normalize(raw == null ? "product" : raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (normalized.isBlank()) normalized = "product";
        return normalized + "-" + (System.currentTimeMillis() % 10000000);
    }

    private static Integer parseInt(String value) {
        try {
            if (value == null || value.isBlank()) return null;
            return Integer.parseInt(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private static int bindParams(PreparedStatement ps, List<Object> params, int startIndex) throws Exception {
        int index = startIndex;
        for (Object param : params) {
            ps.setObject(index++, param);
        }
        return index;
    }

    private static Integer intOrNull(ResultSet rs, String column) throws Exception {
        Object value = rs.getObject(column);
        return value == null ? null : ((Number) value).intValue();
    }

    private static Double doubleOrNull(ResultSet rs, String column) throws Exception {
        Object value = rs.getObject(column);
        return value == null ? null : ((Number) value).doubleValue();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String formatTimestamp(Timestamp timestamp) {
        if (timestamp == null) return null;
        return timestamp.toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    private static Map<String, Object> envelope(Object data, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("data", data);
        body.put("message", message);
        return body;
    }

    private ResponseEntity<?> validationError(Map<String, String> errors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Du lieu khong hop le");
        body.put("code", "VALIDATION_ERROR");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    private ResponseEntity<?> error(HttpStatus status, String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("code", code);
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<?> serverError(String message, Exception e) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        body.put("code", "SERVER_ERROR");
        body.put("detail", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
