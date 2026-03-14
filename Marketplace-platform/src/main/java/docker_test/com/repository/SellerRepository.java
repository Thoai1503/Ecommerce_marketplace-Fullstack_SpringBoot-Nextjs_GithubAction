package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.models.PageResult;
import docker_test.com.models.User;

/**
 * SELLER REPOSITORY
 * userType IN ('seller', 'both')
 * 'both' = vừa bán hàng vừa mua hàng trên cùng 1 tài khoản.
 * Quản lý Nhà bán hàng (Sellers screen).
 */
public class SellerRepository extends UserRepository {

    private static SellerRepository instance;

    // Clause dùng cho mọi query trong repo này
    private static final String TYPE_CLAUSE = "user_type IN ('seller', 'both')";

    private SellerRepository() {
        super();
    }

    public static SellerRepository Instance() {
        if (instance == null) {
            instance = new SellerRepository();
        }
        return instance;
    }

    /* ================= GET ALL SELLERS ================= */

    public List<User> GetAllSellers() {

        String sql = "SELECT * FROM `user` WHERE " + TYPE_CLAUSE + " ORDER BY created_at DESC";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return mapper.RowsMap(rs);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return List.of();
    }

    /* ================= GET SELLER BY ID (chỉ lấy nếu đúng type) ================= */

    public User GetSellerById(int id) {

        String sql = "SELECT * FROM `user` WHERE id = ? AND " + TYPE_CLAUSE;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapper.RowMap(rs);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /* ================= COUNT SELLERS ================= */

    public long CountAll() {

        String sql = "SELECT COUNT(*) FROM `user` WHERE " + TYPE_CLAUSE;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) return rs.getLong(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    public long CountActive() {
        return countByTypeAndActive(1);
    }

    public long CountBlocked() {
        return countByTypeAndActive(0);
    }

    private long countByTypeAndActive(int isActive) {

        String sql = "SELECT COUNT(*) FROM `user` WHERE " + TYPE_CLAUSE + " AND is_active = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, isActive);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getLong(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    /* ================= TOTAL REVENUE ALL SELLERS ================= */

    public double TotalRevenue() {

        String sql = """
            SELECT COALESCE(SUM(o.total_amount), 0)
            FROM `order` o
            JOIN `user` u ON u.id = o.shop_id
            WHERE u.user_type IN ('seller', 'both')
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) return rs.getDouble(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    /* ================= STATS FOR 1 SELLER (detail page) ================= */

    public double GetRevenueById(int sellerId) {

        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM `order` WHERE shop_id= ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, sellerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getDouble(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int GetTotalOrdersById(int sellerId) {

        String sql = "SELECT COUNT(*) FROM `order` WHERE shop_id= ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, sellerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int GetTotalProductsById(int sellerId) {

        String sql = "SELECT COUNT(*) FROM product WHERE shop_id= ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, sellerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    /* ================= FILTER SELLERS (Sellers list screen) ================= */
    // keyword: full_name, email, id
    // isActive: 1=hoạt động, 0=đã khóa, null=tất cả

    public PageResult<User> Filter(
            String  keyword,
            Integer isActive,
            int     page,
            int     pageSize
    ) {
        return FilterByType(TYPE_CLAUSE, keyword, isActive, page, pageSize);
    }
}
