package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Wishlist;

public class WishlistRepository {

    private static WishlistRepository instance = null;
    private final DBConnection dbConnection;

    private WishlistRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static WishlistRepository Instance() {
        if (instance == null) {
            instance = new WishlistRepository();
        }
        return instance;
    }

    public Wishlist Add(long userId, long productId) {
        String sql = """
                INSERT INTO wishlist (user_id, product_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE added_at = added_at
                """;

        try (Connection con = dbConnection.getConn();
                PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, userId);
            ps.setLong(2, productId);
            ps.executeUpdate();

            Wishlist wishlist = GetByUserAndProduct(userId, productId);
            if (wishlist != null) {
                return wishlist;
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    Wishlist created = new Wishlist();
                    created.setId(rs.getLong(1));
                    created.setUserId(userId);
                    created.setProductId(productId);
                    return created;
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    public boolean Remove(long userId, long productId) {
        String sql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, productId);
            return ps.executeUpdate() > 0;
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public boolean Exists(long userId, long productId) {
        String sql = "SELECT 1 FROM wishlist WHERE user_id = ? AND product_id = ? LIMIT 1";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, productId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public boolean ProductExists(long productId) {
        String sql = "SELECT 1 FROM product WHERE id = ? LIMIT 1";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public boolean IsOwnProduct(long userId, long productId) {
        String sql = """
                SELECT 1
                FROM product p
                JOIN shop s ON s.id = p.shop_id
                WHERE p.id = ? AND s.user_id = ?
                LIMIT 1
                """;

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setLong(2, userId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public int CountByUser(long userId) {
        String sql = "SELECT COUNT(*) AS total FROM wishlist WHERE user_id = ?";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("total");
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return 0;
    }

    public Wishlist GetByUserAndProduct(long userId, long productId) {
        String sql = """
                SELECT id, user_id, product_id, added_at
                FROM wishlist
                WHERE user_id = ? AND product_id = ?
                LIMIT 1
                """;

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, productId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rowMap(rs) : null;
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    public List<Map<String, Object>> GetByUserId(long userId) {
        String sql = """
                SELECT
                    w.id AS wishlist_id,
                    w.user_id,
                    w.product_id,
                    w.added_at,
                    p.id,
                    p.shop_id,
                    p.category_id,
                    p.product_name,
                    p.product_slug,
                    p.price,
                    p.original_price,
                    p.stock_quantity,
                    p.sold_count,
                    p.rating,
                    p.review_count,
                    p.is_active,
                    s.shop_name,
                    (
                        SELECT pi.image_url
                        FROM product_image pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.is_thumbnail DESC, pi.display_order ASC, pi.id ASC
                        LIMIT 1
                    ) AS image_url
                FROM wishlist w
                JOIN product p ON p.id = w.product_id
                LEFT JOIN shop s ON s.id = p.shop_id
                WHERE w.user_id = ?
                ORDER BY w.added_at DESC, w.id DESC
                """;

        List<Map<String, Object>> rows = new ArrayList<>();

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("wishlist_id", rs.getLong("wishlist_id"));
                    item.put("user_id", rs.getLong("user_id"));
                    item.put("product_id", rs.getLong("product_id"));
                    item.put("added_at", toLocalDateTime(rs.getTimestamp("added_at")));
                    item.put("id", rs.getLong("id"));
                    item.put("shop_id", rs.getLong("shop_id"));
                    item.put("category_id", rs.getLong("category_id"));
                    item.put("product_name", rs.getString("product_name"));
                    item.put("product_slug", rs.getString("product_slug"));
                    item.put("price", rs.getBigDecimal("price"));
                    item.put("original_price", rs.getBigDecimal("original_price"));
                    item.put("stock_quantity", rs.getInt("stock_quantity"));
                    item.put("sold_count", rs.getInt("sold_count"));
                    item.put("rating", rs.getBigDecimal("rating"));
                    item.put("review_count", rs.getLong("review_count"));
                    item.put("is_active", rs.getInt("is_active"));
                    item.put("shop_name", rs.getString("shop_name"));
                    item.put("image_url", rs.getString("image_url"));
                    rows.add(item);
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return rows;
    }

    private Wishlist rowMap(ResultSet rs) throws java.sql.SQLException {
        Wishlist wishlist = new Wishlist();
        wishlist.setId(rs.getLong("id"));
        wishlist.setUserId(rs.getLong("user_id"));
        wishlist.setProductId(rs.getLong("product_id"));
        wishlist.setAddedAt(toLocalDateTime(rs.getTimestamp("added_at")));
        return wishlist;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
