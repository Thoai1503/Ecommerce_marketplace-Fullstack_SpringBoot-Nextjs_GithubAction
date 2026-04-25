package docker_test.com.repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.PasswordResetToken;

import java.security.SecureRandom;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.Base64;

public class PasswordResetTokenRepository {

    private static PasswordResetTokenRepository instance = null;
    private final DBConnection dbConnection;
    private static final SecureRandom RNG = new SecureRandom();

    private PasswordResetTokenRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static PasswordResetTokenRepository Instance() {
        if (instance == null) instance = new PasswordResetTokenRepository();
        return instance;
    }

    /** Sinh token ngẫu nhiên URL-safe, ~43 ký tự. */
    public static String generateToken() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Tạo token mới cho user + purpose. TTL mặc định 24h. Trả về token string. */
    public String createForUser(long userId, String purpose, long ttlHours) {
        String token = generateToken();
        String sql = """
            INSERT INTO password_reset_token (user_id, token, purpose, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?)
        """;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setString(2, token);
            ps.setString(3, purpose);
            ps.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now().plusHours(ttlHours)));
            ps.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            ps.executeUpdate();
            return token;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public PasswordResetToken findByToken(String token) {
        String sql = "SELECT * FROM password_reset_token WHERE token = ? LIMIT 1";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, token);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    public boolean markUsed(long id) {
        String sql = "UPDATE password_reset_token SET used_at = ? WHERE id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(2, id);
            return ps.executeUpdate() > 0;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    /** Vô hiệu tất cả token chưa dùng của user (dùng khi tạo mới). */
    public void invalidateExistingForUser(long userId, String purpose) {
        String sql = "UPDATE password_reset_token SET used_at = ? WHERE user_id = ? AND purpose = ? AND used_at IS NULL";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(2, userId);
            ps.setString(3, purpose);
            ps.executeUpdate();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private PasswordResetToken map(ResultSet rs) throws SQLException {
        PasswordResetToken t = new PasswordResetToken();
        t.setId(rs.getLong("id"));
        t.setUserId(rs.getLong("user_id"));
        t.setToken(rs.getString("token"));
        t.setPurpose(rs.getString("purpose"));
        Timestamp exp = rs.getTimestamp("expires_at");
        if (exp != null) t.setExpiresAt(exp.toLocalDateTime());
        Timestamp used = rs.getTimestamp("used_at");
        if (used != null) t.setUsedAt(used.toLocalDateTime());
        Timestamp cre = rs.getTimestamp("created_at");
        if (cre != null) t.setCreatedAt(cre.toLocalDateTime());
        return t;
    }
}
