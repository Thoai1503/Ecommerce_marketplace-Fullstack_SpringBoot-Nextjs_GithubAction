package docker_test.com.repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.PasswordResetToken;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class PasswordResetTokenRepository {
    private static PasswordResetTokenRepository instance = null;
    private static final SecureRandom RNG = new SecureRandom();
    private final DBConnection dbConnection;

    public PasswordResetTokenRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static PasswordResetTokenRepository Instance() {
        if (instance == null) {
            instance = new PasswordResetTokenRepository();
        }
        return instance;
    }

    public static String generateToken() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public void save(PasswordResetToken prt) {
        String sql = """
                INSERT INTO password_reset_token (user_id, token, purpose, expires_at, created_at)
                VALUES (?, ?, ?, ?, NOW())
                """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, prt.getUserId());
            ps.setString(2, prt.getToken());
            ps.setString(3, prt.getPurpose());
            ps.setTimestamp(4, Timestamp.valueOf(prt.getExpiresAt()));
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Save password reset token failed: " + e.getMessage(), e);
        }
    }

    public Optional<PasswordResetToken> findActiveByUserId(Long userId, String purpose) {
        String sql = """
                SELECT * FROM password_reset_token
                WHERE user_id = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
                """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setString(2, purpose);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Find active password reset token failed: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public void markUsed(Long id) {
        String sql = "UPDATE password_reset_token SET used_at = NOW() WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Mark password reset token used failed: " + e.getMessage(), e);
        }
    }

    public void deleteByUserId(Long userId) {
        String sql = "DELETE FROM password_reset_token WHERE user_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Delete password reset tokens by user failed: " + e.getMessage(), e);
        }
    }

    public String createForUser(long userId, String purpose, long ttlHours) {
        String token = generateToken();
        PasswordResetToken prt = PasswordResetToken.builder()
                .userId(userId)
                .token(token)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusHours(ttlHours))
                .build();
        save(prt);
        return token;
    }

    public PasswordResetToken findByToken(String token) {
        String sql = "SELECT * FROM password_reset_token WHERE token = ? LIMIT 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, token);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Find password reset token failed: " + e.getMessage(), e);
        }
        return null;
    }

    public void invalidateExistingForUser(long userId, String purpose) {
        String sql = "UPDATE password_reset_token SET used_at = NOW() WHERE user_id = ? AND purpose = ? AND used_at IS NULL";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setString(2, purpose);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Invalidate password reset tokens failed: " + e.getMessage(), e);
        }
    }

    private PasswordResetToken mapRow(ResultSet rs) throws Exception {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(rs.getLong("id"));
        token.setUserId(rs.getLong("user_id"));
        token.setToken(rs.getString("token"));
        token.setPurpose(rs.getString("purpose"));
        token.setExpiresAt(toLocalDateTime(rs.getTimestamp("expires_at")));
        token.setUsedAt(toLocalDateTime(rs.getTimestamp("used_at")));
        token.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        return token;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
