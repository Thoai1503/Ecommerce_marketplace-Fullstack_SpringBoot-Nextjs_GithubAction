package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import docker_test.com.configs.DBConnection;

public class PasswordResetTokenRepository {

    private static final String PURPOSE_RESET_PASSWORD = "RESET_PASSWORD";

    private static PasswordResetTokenRepository instance;
    private final DBConnection dbConnection;

    private PasswordResetTokenRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static PasswordResetTokenRepository Instance() {
        if (instance == null) {
            instance = new PasswordResetTokenRepository();
        }
        return instance;
    }

    public void createResetToken(Long userId, String token, LocalDateTime expiresAt) throws SQLException {
        String revokeSql = """
            UPDATE password_reset_token
            SET used_at = ?
            WHERE user_id = ? AND purpose = ? AND used_at IS NULL
        """;

        String insertSql = """
            INSERT INTO password_reset_token
            (user_id, token, purpose, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn()) {
            if (con == null) {
                throw new SQLException("Unable to open database connection");
            }

            LocalDateTime now = LocalDateTime.now();
            con.setAutoCommit(false);

            try (PreparedStatement revokePs = con.prepareStatement(revokeSql);
                 PreparedStatement insertPs = con.prepareStatement(insertSql)) {

                revokePs.setTimestamp(1, Timestamp.valueOf(now));
                revokePs.setLong(2, userId);
                revokePs.setString(3, PURPOSE_RESET_PASSWORD);
                revokePs.executeUpdate();

                insertPs.setLong(1, userId);
                insertPs.setString(2, token);
                insertPs.setString(3, PURPOSE_RESET_PASSWORD);
                insertPs.setTimestamp(4, Timestamp.valueOf(expiresAt));
                insertPs.setTimestamp(5, Timestamp.valueOf(now));
                insertPs.executeUpdate();

                con.commit();
            } catch (SQLException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public boolean resetPassword(String token, String passwordHash) throws SQLException {
        String tokenSql = """
            SELECT id, user_id, expires_at, used_at
            FROM password_reset_token
            WHERE token = ? AND purpose = ?
            LIMIT 1
            FOR UPDATE
        """;

        String updateUserSql = """
            UPDATE `user`
            SET password_hash = ?, updated_at = ?
            WHERE id = ?
        """;

        String markUsedSql = """
            UPDATE password_reset_token
            SET used_at = ?
            WHERE id = ?
        """;

        try (Connection con = dbConnection.getConn()) {
            if (con == null) {
                throw new SQLException("Unable to open database connection");
            }

            LocalDateTime now = LocalDateTime.now();
            con.setAutoCommit(false);

            try (PreparedStatement tokenPs = con.prepareStatement(tokenSql)) {
                tokenPs.setString(1, token);
                tokenPs.setString(2, PURPOSE_RESET_PASSWORD);

                try (ResultSet rs = tokenPs.executeQuery()) {
                    if (!rs.next()) {
                        con.rollback();
                        return false;
                    }

                    Timestamp expiresAt = rs.getTimestamp("expires_at");
                    Timestamp usedAt = rs.getTimestamp("used_at");
                    if (usedAt != null || expiresAt == null || expiresAt.toLocalDateTime().isBefore(now)) {
                        con.rollback();
                        return false;
                    }

                    long tokenId = rs.getLong("id");
                    long userId = rs.getLong("user_id");

                    try (PreparedStatement userPs = con.prepareStatement(updateUserSql);
                         PreparedStatement usedPs = con.prepareStatement(markUsedSql)) {

                        userPs.setString(1, passwordHash);
                        userPs.setTimestamp(2, Timestamp.valueOf(now));
                        userPs.setLong(3, userId);
                        if (userPs.executeUpdate() == 0) {
                            con.rollback();
                            return false;
                        }

                        usedPs.setTimestamp(1, Timestamp.valueOf(now));
                        usedPs.setLong(2, tokenId);
                        usedPs.executeUpdate();

                        con.commit();
                        return true;
                    }
                }
            } catch (SQLException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }
}
