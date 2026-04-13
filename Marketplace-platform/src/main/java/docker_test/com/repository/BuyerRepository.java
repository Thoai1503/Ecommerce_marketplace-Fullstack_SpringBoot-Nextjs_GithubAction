package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.PageResult;
import docker_test.com.models.User;

/**
 * BUYER REPOSITORY
 * userType IN ('buyer', 'shipper')
 * Quản lý Khách hàng (Customers screen).
 */
public class BuyerRepository extends UserRepository {
    private DBConnection dbConnection;

    private static BuyerRepository instance;

    private static final String TYPE_CLAUSE = "user_type IN ('buyer', 'shipper')";

    private BuyerRepository() {
        super();
    }

    public static BuyerRepository Instance() {
        if (instance == null) {
            instance = new BuyerRepository();
        }
        return instance;
    }

    /* ================= GET ALL BUYERS ================= */

    public List<User> GetAllBuyers() {

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

    /* ================= GET BUYER BY ID ================= */

    public User GetBuyerById(int id) {

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

    /* ================= AGGREGATE STATS FOR 1 BUYER (detail page) ================= */

    public int GetTotalOrdersById(int buyerId) {

        String sql = "SELECT COUNT(*) FROM `order` WHERE user_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, buyerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    public double GetTotalSpentById(int buyerId) {

        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM `order` WHERE user_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, buyerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getDouble(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    public double GetAvgOrderValueById(int buyerId) {

        String sql = "SELECT COALESCE(AVG(total_amount), 0) FROM `order` WHERE user_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, buyerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getDouble(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    /* ================= UPDATE NOTE (ghi chú nội bộ) ================= */
    // Lưu ý: nếu User model không có field note, cần thêm cột note vào DB
    // hoặc dùng bảng riêng customer_note

    public boolean UpdateNote(int id, String note) {

        String sql = "UPDATE `user` SET note = ?, updated_at = ? WHERE id = ? AND " + TYPE_CLAUSE;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1,    note);
            ps.setTimestamp(2, Timestamp.valueOf(java.time.LocalDateTime.now()));
            ps.setInt(3,       id);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    /* ================= FILTER BUYERS (Customers list screen) ================= */
    // keyword: full_name, email, phone
    // isActive: 1=active, 0=blocked, null=tất cả

    public PageResult<User> Filter(
            String  keyword,
            Integer isActive,
            int     page,
            int     pageSize
    ) {
        return FilterByType(TYPE_CLAUSE, keyword, isActive, page, pageSize);
    }
}
