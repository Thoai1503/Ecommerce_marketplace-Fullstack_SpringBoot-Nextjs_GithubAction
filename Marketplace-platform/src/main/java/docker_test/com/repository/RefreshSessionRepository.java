package docker_test.com.repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.RefreshSession;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Repository
public class RefreshSessionRepository {
    private final DBConnection dbConnection;

    public RefreshSessionRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public void createSession(String id, Long userId, String tokenHash, String userAgent, String ip, Timestamp expiresAt) {
        String sql = """
                INSERT INTO refresh_sessions
                (id, user_id, token_hash, user_agent, ip_first, ip_last, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setLong(2, userId);
            ps.setString(3, tokenHash);
            ps.setString(4, userAgent);
            ps.setString(5, ip);
            ps.setString(6, ip);
            ps.setTimestamp(7, expiresAt);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Create refresh session failed: " + e.getMessage(), e);
        }
    }

    public RefreshSession findById(String id) {
        String sql = "SELECT * FROM refresh_sessions WHERE id = ? LIMIT 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Find refresh session failed: " + e.getMessage(), e);
        }
        return null;
    }

    public RefreshSession findByTokenHash(String hash) {
        String sql = """
                SELECT * FROM refresh_sessions
                WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
                LIMIT 1
                """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, hash);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Find refresh session by token hash failed: " + e.getMessage(), e);
        }
        return null;
    }

    public RefreshSession findAnyByTokenHash(String hash) {
        String sql = "SELECT * FROM refresh_sessions WHERE token_hash = ? LIMIT 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, hash);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Find any refresh session by token hash failed: " + e.getMessage(), e);
        }
        return null;
    }

    public boolean hasRotatedChild(String id) {
        String sql = "SELECT 1 FROM refresh_sessions WHERE rotated_from = ? LIMIT 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            throw new RuntimeException("Check rotated child failed: " + e.getMessage(), e);
        }
    }

    public List<RefreshSession> findActiveByUserId(long userId) {
        String sql = """
                SELECT * FROM refresh_sessions
                WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
                ORDER BY last_used_at DESC
                """;
        List<RefreshSession> sessions = new ArrayList<>();

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    sessions.add(mapRow(rs));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Find active refresh sessions failed: " + e.getMessage(), e);
        }
        return sessions;
    }

    public void revokeById(String id) {
        String sql = "UPDATE refresh_sessions SET revoked_at = NOW() WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Revoke refresh session failed: " + e.getMessage(), e);
        }
    }

    public int revokeAllByUserId(long userId) {
        String sql = "UPDATE refresh_sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            return ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Revoke all refresh sessions failed: " + e.getMessage(), e);
        }
    }

    public void rotate(String oldId, String newId, Long userId, String newTokenHash, Timestamp newExpiresAt,
                       String userAgent, String ip) {
        String revokeSql = "UPDATE refresh_sessions SET revoked_at = NOW() WHERE id = ?";
        String insertSql = """
                INSERT INTO refresh_sessions
                (id, user_id, token_hash, user_agent, ip_first, ip_last, expires_at, rotated_from, created_at, last_used_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                """;

        try (Connection con = dbConnection.getConn()) {
            boolean originalAutoCommit = con.getAutoCommit();
            try {
                con.setAutoCommit(false);

                try (PreparedStatement revokePs = con.prepareStatement(revokeSql)) {
                    revokePs.setString(1, oldId);
                    revokePs.executeUpdate();
                }

                try (PreparedStatement insertPs = con.prepareStatement(insertSql)) {
                    insertPs.setString(1, newId);
                    insertPs.setLong(2, userId);
                    insertPs.setString(3, newTokenHash);
                    insertPs.setString(4, userAgent);
                    insertPs.setString(5, ip);
                    insertPs.setString(6, ip);
                    insertPs.setTimestamp(7, newExpiresAt);
                    insertPs.setString(8, oldId);
                    insertPs.executeUpdate();
                }

                con.commit();
            } catch (Exception e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(originalAutoCommit);
            }
        } catch (Exception e) {
            throw new RuntimeException("Rotate refresh session failed: " + e.getMessage(), e);
        }
    }

    public void updateLastUsed(String id, String ip) {
        String sql = "UPDATE refresh_sessions SET last_used_at = NOW(), ip_last = ? WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, ip);
            ps.setString(2, id);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Update refresh session last used failed: " + e.getMessage(), e);
        }
    }

    private RefreshSession mapRow(ResultSet rs) throws Exception {
        RefreshSession session = new RefreshSession();
        session.setId(rs.getString("id"));
        session.setUserId(rs.getLong("user_id"));
        session.setTokenHash(rs.getString("token_hash"));
        session.setUserAgent(rs.getString("user_agent"));
        session.setIpFirst(rs.getString("ip_first"));
        session.setIpLast(rs.getString("ip_last"));
        session.setExpiresAt(toLocalDateTime(rs.getTimestamp("expires_at")));
        session.setRevokedAt(toLocalDateTime(rs.getTimestamp("revoked_at")));
        session.setRotatedFrom(rs.getString("rotated_from"));
        session.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
        session.setLastUsedAt(toLocalDateTime(rs.getTimestamp("last_used_at")));
        return session;
    }

    private java.time.LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
