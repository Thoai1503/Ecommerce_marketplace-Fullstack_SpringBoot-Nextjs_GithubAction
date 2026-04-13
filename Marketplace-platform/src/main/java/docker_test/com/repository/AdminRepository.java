package docker_test.com.repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.PageResult;
import docker_test.com.models.User;

/**
 * ADMIN REPOSITORY
 * userType = 'admin'
 * Quản lý toàn bộ tài khoản trong hệ thống (User Management screen).
 * Có thể xem/khóa/đổi role bất kỳ user nào.
 */
public class AdminRepository extends UserRepository {

    private static AdminRepository instance;
    private DBConnection dbConnection;

    private AdminRepository() {
        super();
    }

    public static AdminRepository Instance() {
        if (instance == null) {
            instance = new AdminRepository();
        }
        return instance;
    }

    /* ================= GET ALL ADMINS ================= */

    public List<User> GetAllAdmins() {

        String sql = "SELECT * FROM `user` WHERE user_type = 'admin' ORDER BY created_at DESC";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return mapper.RowsMap(rs);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return List.of();
    }

    /* ================= CHANGE USER ROLE ================= */

    public boolean changeUserType(int id, String newUserType) {

        String sql = "UPDATE `user` SET user_type = ?, updated_at = ? WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1,    newUserType);
            ps.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            ps.setInt(3,       id);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    /* ================= FILTER ALL USERS (User Management screen) ================= */
    // Tìm theo email hoặc ID, lọc theo role, lọc theo isActive
    // Hiển thị tất cả userType trong cùng 1 bảng

    public PageResult<User> Filter(
            String  keyword,
            String  userType,   // null = tất cả role
            Integer isActive,   // null = tất cả trạng thái
            int     page,
            int     pageSize
    ) {
        String typeClause = (userType != null && !userType.isBlank())
                ? "user_type = '" + userType.replace("'", "''") + "'"
                : null; // null = không lọc theo type → lấy tất cả

        return FilterByType(typeClause, keyword, isActive, page, pageSize);
    }
}
