package docker_test.com.controllers.admin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.configs.DBConnection;

/**
 * AdminOrderController — Quản lý đơn hàng cho admin.
 * - Dùng raw JDBC trực tiếp tới bảng `orders`, `order_item`, `order_shipment`, `user`, `address`.
 * - Trả về DTO camelCase, sẵn sàng cho FE Next.js.
 * - Standardize order_status UPPERCASE (PENDING/CONFIRMED/PROCESSING/SHIPPED/COMPLETED/CANCELLED/REFUNDED).
 */
@RestController
@RequestMapping("/admin/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AdminOrderController {

    private final DBConnection db = DBConnection.getInstance();

    private static final Set<String> ALL_STATUSES = new HashSet<>(Arrays.asList(
            "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED",
            "COMPLETED", "CANCELLED", "REFUNDED"
    ));

    // Allowed transitions
    private static final Map<String, Set<String>> TRANSITIONS = new HashMap<>();
    static {
        TRANSITIONS.put("PENDING", new HashSet<>(Arrays.asList("CONFIRMED", "CANCELLED")));
        TRANSITIONS.put("CONFIRMED", new HashSet<>(Arrays.asList("PROCESSING", "CANCELLED")));
        TRANSITIONS.put("PROCESSING", new HashSet<>(Arrays.asList("SHIPPED", "CANCELLED")));
        TRANSITIONS.put("SHIPPED", new HashSet<>(Arrays.asList("COMPLETED", "CANCELLED")));
        TRANSITIONS.put("COMPLETED", new HashSet<>(Arrays.asList("REFUNDED")));
        TRANSITIONS.put("CANCELLED", new HashSet<>());
        TRANSITIONS.put("REFUNDED", new HashSet<>());
    }

    /* ===================== LIST ===================== */
    @GetMapping("")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {

        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            where.append(" AND UPPER(o.order_status) = ? ");
            params.add(status.toUpperCase());
        }
        if (search != null && !search.isBlank()) {
            where.append(" AND (o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?) ");
            String like = "%" + search + "%";
            params.add(like); params.add(like); params.add(like);
        }
        if (dateFrom != null && !dateFrom.isBlank()) {
            where.append(" AND o.created_at >= ? ");
            params.add(parseDateStart(dateFrom));
        }
        if (dateTo != null && !dateTo.isBlank()) {
            where.append(" AND o.created_at <= ? ");
            params.add(parseDateEnd(dateTo));
        }
        if (minAmount != null) { where.append(" AND o.final_amount >= ? "); params.add(minAmount); }
        if (maxAmount != null) { where.append(" AND o.final_amount <= ? "); params.add(maxAmount); }

        String sortColumn = switch (sortBy == null ? "" : sortBy) {
            case "amount", "totalAmount", "finalAmount" -> "o.final_amount";
            case "status" -> "o.order_status";
            default -> "o.created_at";
        };
        String dir = "asc".equalsIgnoreCase(sortOrder) ? "ASC" : "DESC";
        if (page < 1) page = 1;
        if (size < 1 || size > 200) size = 20;
        int offset = (page - 1) * size;

        String baseFrom = " FROM `orders` o "
                + " LEFT JOIN `user` u ON u.id = o.user_id "
                + " LEFT JOIN `address` a ON a.id = o.address_id ";

        String listSql = "SELECT o.*, "
                + " u.full_name AS u_full_name, u.email AS u_email, u.phone AS u_phone, "
                + " a.recipient_name AS a_recipient_name, a.recipient_phone AS a_recipient_phone, a.address_line AS a_address_line "
                + baseFrom + where + " ORDER BY " + sortColumn + " " + dir + " LIMIT ? OFFSET ? ";
        String countSql = "SELECT COUNT(*) " + baseFrom + where;

        List<Map<String, Object>> data = new ArrayList<>();
        int total = 0;
        Map<String, Integer> statusStats = new HashMap<>();
        try (Connection con = db.getConn()) {
            // count
            try (PreparedStatement ps = con.prepareStatement(countSql)) {
                bind(ps, params);
                try (ResultSet rs = ps.executeQuery()) { if (rs.next()) total = rs.getInt(1); }
            }
            // list
            List<Object> listParams = new ArrayList<>(params);
            listParams.add(size); listParams.add(offset);
            try (PreparedStatement ps = con.prepareStatement(listSql)) {
                bind(ps, listParams);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) data.add(mapOrderListRow(rs));
                }
            }
            // status stats (across full table, ignoring filters — used for tabs)
            try (PreparedStatement ps = con.prepareStatement(
                    "SELECT UPPER(order_status) s, COUNT(*) c FROM `orders` GROUP BY UPPER(order_status)");
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) statusStats.put(rs.getString(1), rs.getInt(2));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không tải được danh sách đơn hàng"));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        result.put("statusStats", statusStats);
        return ResponseEntity.ok(result);
    }

    /* ===================== DETAIL ===================== */
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable long id) {
        try (Connection con = db.getConn()) {
            Map<String, Object> dto;
            String sql = "SELECT o.*, "
                    + " u.full_name AS u_full_name, u.email AS u_email, u.phone AS u_phone, "
                    + " a.recipient_name AS a_recipient_name, a.recipient_phone AS a_recipient_phone, a.address_line AS a_address_line "
                    + " FROM `orders` o "
                    + " LEFT JOIN `user` u ON u.id = o.user_id "
                    + " LEFT JOIN `address` a ON a.id = o.address_id "
                    + " WHERE o.id = ? ";
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setLong(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("message", "Không tìm thấy đơn hàng"));
                    dto = mapOrderListRow(rs);
                }
            }

            // items
            List<Map<String, Object>> items = new ArrayList<>();
            String itemSql = "SELECT oi.*, "
                    + " (SELECT pi.image_url FROM product_image pi WHERE pi.product_id = oi.product_id ORDER BY pi.id ASC LIMIT 1) AS product_image "
                    + " FROM `order_item` oi WHERE oi.order_id = ? ";
            try (PreparedStatement ps = con.prepareStatement(itemSql)) {
                ps.setLong(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) items.add(mapItemRow(rs));
                }
            }
            dto.put("items", items);
            dto.put("itemsCount", items.size());

            // shipments
            List<Map<String, Object>> shipments = new ArrayList<>();
            String shipSql = "SELECT s.*, sh.shop_name AS shop_name FROM `order_shipment` s "
                    + " LEFT JOIN `shop` sh ON sh.id = s.shop_id WHERE s.order_id = ? ";
            try (PreparedStatement ps = con.prepareStatement(shipSql)) {
                ps.setLong(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) shipments.add(mapShipmentRow(rs));
                }
            }
            dto.put("shipments", shipments);

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không tải được chi tiết đơn hàng"));
        }
    }

    /* ===================== UPDATE STATUS ===================== */
    public static class StatusUpdateRequest { public String status; public String note; }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable long id, @RequestBody StatusUpdateRequest req) {
        if (req == null || req.status == null || req.status.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không được để trống"));
        String newStatus = req.status.toUpperCase();
        if (!ALL_STATUSES.contains(newStatus))
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không hợp lệ"));

        try (Connection con = db.getConn()) {
            String currentStatus = getCurrentStatus(con, id);
            if (currentStatus == null)
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy đơn hàng"));

            Set<String> allowed = TRANSITIONS.getOrDefault(currentStatus, new HashSet<>());
            if (!allowed.contains(newStatus))
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus));

            // Build update — set timestamps based on target status
            StringBuilder sql = new StringBuilder("UPDATE `orders` SET order_status = ?, updated_at = NOW() ");
            List<Object> params = new ArrayList<>();
            params.add(newStatus);
            switch (newStatus) {
                case "CANCELLED" -> {
                    sql.append(", cancelled_at = NOW() ");
                    if (req.note != null) { sql.append(", cancelled_reason = ? "); params.add(req.note); }
                }
                case "COMPLETED" -> sql.append(", delivered_at = NOW() ");
                default -> { /* no extra timestamps */ }
            }
            sql.append(" WHERE id = ? ");
            params.add(id);
            try (PreparedStatement ps = con.prepareStatement(sql.toString())) {
                bind(ps, params);
                ps.executeUpdate();
            }
            return ResponseEntity.ok(Map.of("success", true, "status", newStatus));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật trạng thái thất bại"));
        }
    }

    /* ===================== UPDATE TRACKING ===================== */
    public static class TrackingRequest { public String trackingNumber; public String carrier; public Long shipmentId; }

    @PutMapping("/{id}/tracking")
    public ResponseEntity<?> updateTracking(@PathVariable long id, @RequestBody TrackingRequest req) {
        if (req == null || req.trackingNumber == null || req.trackingNumber.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Mã vận đơn không được để trống"));

        try (Connection con = db.getConn()) {
            // Update orders table tracking_number for back-compat
            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE `orders` SET tracking_number = ?, updated_at = NOW() WHERE id = ?")) {
                ps.setString(1, req.trackingNumber);
                ps.setLong(2, id);
                if (ps.executeUpdate() == 0)
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy đơn hàng"));
            }
            // Update shipment(s) — either specific shipment or all on order
            String sSql = req.shipmentId != null
                    ? "UPDATE `order_shipment` SET tracking_number = ?, " + (req.carrier != null ? "carrier_name = ?, " : "") + "updated_at = NOW() WHERE id = ? AND order_id = ?"
                    : "UPDATE `order_shipment` SET tracking_number = ?, " + (req.carrier != null ? "carrier_name = ?, " : "") + "updated_at = NOW() WHERE order_id = ?";
            try (PreparedStatement ps = con.prepareStatement(sSql)) {
                int idx = 1;
                ps.setString(idx++, req.trackingNumber);
                if (req.carrier != null) ps.setString(idx++, req.carrier);
                if (req.shipmentId != null) { ps.setLong(idx++, req.shipmentId); ps.setLong(idx, id); }
                else ps.setLong(idx, id);
                ps.executeUpdate();
            }
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật mã vận đơn thất bại"));
        }
    }

    /* ===================== CANCEL ===================== */
    public static class CancelRequest { public String reason; }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable long id, @RequestBody CancelRequest req) {
        if (req == null || req.reason == null || req.reason.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Lý do hủy không được để trống"));
        try (Connection con = db.getConn()) {
            String current = getCurrentStatus(con, id);
            if (current == null)
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy đơn hàng"));
            if ("COMPLETED".equals(current) || "CANCELLED".equals(current) || "REFUNDED".equals(current))
                return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn ở trạng thái " + current));

            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE `orders` SET order_status = 'CANCELLED', cancelled_reason = ?, cancelled_at = NOW(), updated_at = NOW() WHERE id = ?")) {
                ps.setString(1, req.reason);
                ps.setLong(2, id);
                ps.executeUpdate();
            }
            return ResponseEntity.ok(Map.of("success", true, "status", "CANCELLED"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Hủy đơn thất bại"));
        }
    }

    /* ===================== REFUND ===================== */
    public static class RefundRequest { public Double amount; public String reason; }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refund(@PathVariable long id, @RequestBody RefundRequest req) {
        if (req == null || req.reason == null || req.reason.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Lý do hoàn tiền không được để trống"));
        if (req.amount == null || req.amount <= 0)
            return ResponseEntity.badRequest().body(Map.of("message", "Số tiền hoàn không hợp lệ"));

        try (Connection con = db.getConn()) {
            String current = getCurrentStatus(con, id);
            if (current == null)
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy đơn hàng"));
            if (!"COMPLETED".equals(current) && !"CANCELLED".equals(current))
                return ResponseEntity.badRequest().body(Map.of("message",
                        "Chỉ có thể hoàn tiền đơn đã hoàn tất hoặc đã hủy (hiện tại: " + current + ")"));

            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE `orders` SET order_status = 'REFUNDED', payment_status = 'REFUNDED', "
                  + " cancelled_reason = CONCAT('REFUND: ', ?), updated_at = NOW() WHERE id = ?")) {
                ps.setString(1, req.reason);
                ps.setLong(2, id);
                ps.executeUpdate();
            }
            return ResponseEntity.ok(Map.of("success", true, "status", "REFUNDED", "amount", req.amount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Hoàn tiền thất bại"));
        }
    }

    /* ===================== UPDATE ORDER ITEMS ===================== */
    public static class OrderItemPayload {
        public Long itemId;
        public Long productId;
        public Long variantId;
        public Integer quantity;
        public Double price;
    }
    public static class UpdateItemsRequest {
        public List<OrderItemPayload> items;
        public String reason;
    }

    @PutMapping("/{id}/items")
    public ResponseEntity<?> updateItems(@PathVariable long id, @RequestBody UpdateItemsRequest req) {
        if (req == null || req.items == null || req.items.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Danh sách sản phẩm không được để trống"));
        for (OrderItemPayload it : req.items) {
            if (it.productId == null)
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu productId trong sản phẩm"));
            if (it.quantity == null || it.quantity < 1)
                return ResponseEntity.badRequest().body(Map.of("message", "Số lượng phải >= 1"));
            if (it.price == null || it.price < 0)
                return ResponseEntity.badRequest().body(Map.of("message", "Giá sản phẩm không hợp lệ"));
        }

        Connection con = null;
        try {
            con = db.getConn();
            con.setAutoCommit(false);

            // Validate order status — only PENDING/CONFIRMED can edit
            String current = getCurrentStatus(con, id);
            if (current == null) {
                con.rollback();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy đơn hàng"));
            }
            if (!"PENDING".equals(current) && !"CONFIRMED".equals(current)) {
                con.rollback();
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Chỉ có thể chỉnh sửa sản phẩm khi đơn hàng đang ở trạng thái PENDING hoặc CONFIRMED (hiện tại: " + current + ")"));
            }

            // Pick a fallback shipment_id for new items (required NOT NULL)
            long fallbackShipmentId = 0;
            try (PreparedStatement ps = con.prepareStatement(
                    "SELECT id FROM `order_shipment` WHERE order_id = ? ORDER BY id ASC LIMIT 1")) {
                ps.setLong(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) fallbackShipmentId = rs.getLong(1);
                }
            }

            // Delete old items
            deleteItemsByOrderId(con, id);

            // Insert new items
            for (OrderItemPayload it : req.items) {
                insertOrderItem(con, id, it, fallbackShipmentId);
            }

            // Recalculate order final_amount
            recalculateOrderTotal(con, id);

            // Log action via cancelled_reason concat? — append note to `note` column for traceability
            if (req.reason != null && !req.reason.isBlank()) {
                try (PreparedStatement ps = con.prepareStatement(
                        "UPDATE `orders` SET note = CONCAT(COALESCE(note, ''), '\n[EDIT ITEMS] ', ?), updated_at = NOW() WHERE id = ?")) {
                    ps.setString(1, req.reason);
                    ps.setLong(2, id);
                    ps.executeUpdate();
                }
            } else {
                try (PreparedStatement ps = con.prepareStatement(
                        "UPDATE `orders` SET updated_at = NOW() WHERE id = ?")) {
                    ps.setLong(1, id);
                    ps.executeUpdate();
                }
            }

            con.commit();
        } catch (Exception e) {
            e.printStackTrace();
            try { if (con != null) con.rollback(); } catch (Exception ignore) {}
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật sản phẩm đơn hàng thất bại"));
        } finally {
            try { if (con != null) { con.setAutoCommit(true); con.close(); } } catch (Exception ignore) {}
        }

        // Return updated detail
        return detail(id);
    }

    private void deleteItemsByOrderId(Connection con, long orderId) throws SQLException {
        try (PreparedStatement ps = con.prepareStatement("DELETE FROM `order_item` WHERE order_id = ?")) {
            ps.setLong(1, orderId);
            ps.executeUpdate();
        }
    }

    private void insertOrderItem(Connection con, long orderId, OrderItemPayload it, long fallbackShipmentId) throws SQLException {
        // Lookup product info (shop_id, product_name) and optional variant_name
        long shopId = 0;
        String productName = "";
        try (PreparedStatement ps = con.prepareStatement(
                "SELECT shop_id, product_name FROM `product` WHERE id = ?")) {
            ps.setLong(1, it.productId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) { shopId = rs.getLong(1); productName = rs.getString(2); }
                else throw new SQLException("Sản phẩm không tồn tại: " + it.productId);
            }
        }
        String variantName = null;
        if (it.variantId != null) {
            try (PreparedStatement ps = con.prepareStatement(
                    "SELECT variant_name FROM `product_variant` WHERE id = ?")) {
                ps.setLong(1, it.variantId);
                try (ResultSet rs = ps.executeQuery()) { if (rs.next()) variantName = rs.getString(1); }
            } catch (SQLException ignore) { /* table/col may differ — best-effort */ }
        }

        // Find shipment for this shop on this order, fall back to first shipment
        long shipmentId = fallbackShipmentId;
        try (PreparedStatement ps = con.prepareStatement(
                "SELECT id FROM `order_shipment` WHERE order_id = ? AND shop_id = ? ORDER BY id ASC LIMIT 1")) {
            ps.setLong(1, orderId);
            ps.setLong(2, shopId);
            try (ResultSet rs = ps.executeQuery()) { if (rs.next()) shipmentId = rs.getLong(1); }
        }
        if (shipmentId == 0) {
            throw new SQLException("Không tìm thấy kiện hàng phù hợp để thêm sản phẩm");
        }

        double total = it.price * it.quantity;
        try (PreparedStatement ps = con.prepareStatement(
                "INSERT INTO `order_item` (order_id, shipment_id, product_id, variant_id, product_name, variant_name, price, quantity, total_price, created_at, shop_id) "
              + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)")) {
            ps.setLong(1, orderId);
            ps.setLong(2, shipmentId);
            ps.setLong(3, it.productId);
            if (it.variantId != null) ps.setLong(4, it.variantId); else ps.setNull(4, Types.BIGINT);
            ps.setString(5, productName);
            if (variantName != null) ps.setString(6, variantName); else ps.setNull(6, Types.VARCHAR);
            ps.setDouble(7, it.price);
            ps.setInt(8, it.quantity);
            ps.setDouble(9, total);
            ps.setLong(10, shopId);
            ps.executeUpdate();
        }
    }

    private void recalculateOrderTotal(Connection con, long orderId) throws SQLException {
        double itemsTotal = 0;
        try (PreparedStatement ps = con.prepareStatement(
                "SELECT COALESCE(SUM(total_price), 0) FROM `order_item` WHERE order_id = ?")) {
            ps.setLong(1, orderId);
            try (ResultSet rs = ps.executeQuery()) { if (rs.next()) itemsTotal = rs.getDouble(1); }
        }
        // final_amount = total_amount + shipping_fee - discount_amount
        try (PreparedStatement ps = con.prepareStatement(
                "UPDATE `orders` SET total_amount = ?, "
              + " final_amount = ? + COALESCE(shipping_fee,0) - COALESCE(discount_amount,0), "
              + " updated_at = NOW() WHERE id = ?")) {
            ps.setDouble(1, itemsTotal);
            ps.setDouble(2, itemsTotal);
            ps.setLong(3, orderId);
            ps.executeUpdate();
        }
    }

    /* ===================== UPDATE SHIPMENT STATUS ===================== */
    public static class ShipmentStatusRequest { public String status; }

    @PutMapping("/shipments/{shipmentId}/status")
    public ResponseEntity<?> updateShipmentStatus(@PathVariable long shipmentId, @RequestBody ShipmentStatusRequest req) {
        if (req == null || req.status == null || req.status.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không được để trống"));
        Set<String> shipStatuses = new HashSet<>(Arrays.asList(
                "PENDING", "CONFIRMED", "PICKED_UP", "SHIPPING", "DELIVERING", "DELIVERED", "FAILED", "RETURNED"));
        String newStatus = req.status.toUpperCase();
        if (!shipStatuses.contains(newStatus))
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái vận chuyển không hợp lệ"));

        try (Connection con = db.getConn()) {
            try (PreparedStatement ps = con.prepareStatement(
                    "UPDATE `order_shipment` SET shipping_status = ?, updated_at = NOW() WHERE id = ?")) {
                ps.setString(1, newStatus);
                ps.setLong(2, shipmentId);
                if (ps.executeUpdate() == 0)
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy kiện hàng"));
            }
            return ResponseEntity.ok(Map.of("success", true, "status", newStatus));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật trạng thái kiện hàng thất bại"));
        }
    }

    /* ===================== HELPERS ===================== */
    private String getCurrentStatus(Connection con, long id) throws SQLException {
        try (PreparedStatement ps = con.prepareStatement("SELECT UPPER(order_status) FROM `orders` WHERE id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getString(1);
            }
        }
        return null;
    }

    private void bind(PreparedStatement ps, List<Object> params) throws SQLException {
        for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
    }

    private Timestamp parseDateStart(String s) {
        try { return Timestamp.valueOf(s.length() == 10 ? s + " 00:00:00" : s.replace("T", " ")); }
        catch (Exception e) { return null; }
    }
    private Timestamp parseDateEnd(String s) {
        try { return Timestamp.valueOf(s.length() == 10 ? s + " 23:59:59" : s.replace("T", " ")); }
        catch (Exception e) { return null; }
    }

    private static String iso(Timestamp ts) {
        return ts == null ? null : ts.toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    private Map<String, Object> mapOrderListRow(ResultSet rs) throws SQLException {
        Map<String, Object> m = new HashMap<>();
        long id = rs.getLong("id");
        m.put("id", String.valueOf(id));
        m.put("orderId", id);
        m.put("orderCode", rs.getString("order_number"));
        m.put("orderNumber", rs.getString("order_number"));
        long userId = rs.getLong("user_id");
        m.put("userId", userId);
        m.put("customerId", String.valueOf(userId));
        m.put("addressId", rs.getLong("address_id"));

        double total = rs.getDouble("total_amount");
        double finalAmount = rs.getDouble("final_amount");
        double shippingFee = rs.getDouble("shipping_fee");
        double discount = rs.getDouble("discount_amount");
        m.put("subtotalAmount", total);
        m.put("totalAmount", finalAmount);
        m.put("finalAmount", finalAmount);
        m.put("shippingAmount", shippingFee);
        m.put("shippingFee", shippingFee);
        m.put("discountAmount", discount);
        m.put("taxAmount", 0);

        m.put("paymentMethod", rs.getString("payment_method"));
        String pay = rs.getString("payment_status");
        m.put("paymentStatus", pay == null ? "UNPAID" : pay.toUpperCase());
        String st = rs.getString("order_status");
        m.put("status", st == null ? "PENDING" : st.toUpperCase());
        m.put("orderStatus", st == null ? "PENDING" : st.toUpperCase());

        m.put("note", rs.getString("note"));
        m.put("internalNote", rs.getString("note"));
        m.put("trackingNumber", rs.getString("tracking_number"));
        m.put("deliveryNumber", rs.getString("tracking_number"));
        m.put("transactionId", "");
        m.put("priority", "NORMAL");

        m.put("cancelledReason", rs.getString("cancelled_reason"));
        m.put("cancelledAt", iso(rs.getTimestamp("cancelled_at")));
        m.put("deliveredAt", iso(rs.getTimestamp("delivered_at")));
        m.put("createdAt", iso(rs.getTimestamp("created_at")));
        m.put("updatedAt", iso(rs.getTimestamp("updated_at")));

        // Customer info from JOIN (safe getString — columns may be absent in some queries)
        String fullName = safeGet(rs, "u_full_name");
        String email = safeGet(rs, "u_email");
        String phone = safeGet(rs, "u_phone");
        String aRecipient = safeGet(rs, "a_recipient_name");
        String aPhone = safeGet(rs, "a_recipient_phone");
        String aLine = safeGet(rs, "a_address_line");
        m.put("customerName", aRecipient != null && !aRecipient.isBlank() ? aRecipient
                : (fullName != null ? fullName : "Khách hàng #" + userId));
        m.put("customerEmail", email != null ? email : "");
        m.put("customerPhone", aPhone != null && !aPhone.isBlank() ? aPhone : (phone != null ? phone : ""));
        m.put("shippingAddress", aLine != null ? aLine : "");
        return m;
    }

    private Map<String, Object> mapItemRow(ResultSet rs) throws SQLException {
        Map<String, Object> m = new HashMap<>();
        long iid = rs.getLong("id");
        m.put("id", String.valueOf(iid));
        m.put("orderItemId", iid);
        m.put("orderId", rs.getLong("order_id"));
        m.put("productId", rs.getLong("product_id"));
        long vid = rs.getLong("variant_id");
        m.put("variantId", rs.wasNull() ? null : vid);
        m.put("productName", rs.getString("product_name"));
        m.put("variantName", rs.getString("variant_name"));
        m.put("variant", rs.getString("variant_name"));
        m.put("sku", "SKU-" + rs.getLong("product_id") + (rs.getObject("variant_id") != null ? "-" + rs.getLong("variant_id") : ""));
        m.put("price", rs.getDouble("price"));
        m.put("quantity", rs.getInt("quantity"));
        m.put("totalPrice", rs.getDouble("total_price"));
        String img = safeGet(rs, "product_image");
        m.put("productImage", img != null ? img : "https://placehold.co/100x100?text=No+Image");
        m.put("status", "Ready");
        m.put("createdAt", iso(rs.getTimestamp("created_at")));
        return m;
    }

    private Map<String, Object> mapShipmentRow(ResultSet rs) throws SQLException {
        Map<String, Object> m = new HashMap<>();
        long sid = rs.getLong("id");
        m.put("id", String.valueOf(sid));
        m.put("shipmentId", sid);
        m.put("order_id", String.valueOf(rs.getLong("order_id")));
        m.put("orderId", rs.getLong("order_id"));
        m.put("shop_id", String.valueOf(rs.getLong("shop_id")));
        m.put("shopId", rs.getLong("shop_id"));
        String shopName = safeGet(rs, "shop_name");
        m.put("shopName", shopName != null ? shopName : "Shop #" + rs.getLong("shop_id"));
        m.put("tracking_number", rs.getString("tracking_number"));
        m.put("trackingNumber", rs.getString("tracking_number"));
        m.put("carrier_name", rs.getString("carrier_name"));
        m.put("carrierName", rs.getString("carrier_name"));
        String st = rs.getString("shipping_status");
        m.put("shipping_status", st == null ? "PENDING" : st.toUpperCase());
        m.put("shippingStatus", st == null ? "PENDING" : st.toUpperCase());
        m.put("shipping_fee", rs.getDouble("shipping_fee"));
        m.put("shippingFee", rs.getDouble("shipping_fee"));
        m.put("estimated_delivery_at", iso(rs.getTimestamp("estimated_delivery_at")));
        m.put("created_at", iso(rs.getTimestamp("created_at")));
        m.put("updated_at", iso(rs.getTimestamp("updated_at")));
        m.put("items", new ArrayList<>());
        m.put("statusHistory", new ArrayList<>());
        return m;
    }

    private static String safeGet(ResultSet rs, String col) {
        try { return rs.getString(col); } catch (SQLException e) { return null; }
    }
}
