package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Notification;

public class NotificationRepository {
    private static NotificationRepository instance = null;
    private final DBConnection dbConnection;

    private NotificationRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static NotificationRepository Instance() {
        if (instance == null) {
            instance = new NotificationRepository();
        }
        return instance;
    }

    public Notification Create(Notification notification) {
        String sql = """
                INSERT INTO notification (user_id, type, title, message, reference_id, is_read)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection con = dbConnection.getConn();
                PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, notification.getUserId());
            ps.setString(2, normalizeType(notification.getType()));
            ps.setString(3, notification.getTitle());
            ps.setString(4, notification.getMessage());
            if (notification.getReferenceId() == null) {
                ps.setNull(5, java.sql.Types.BIGINT);
            } else {
                ps.setLong(5, notification.getReferenceId());
            }
            ps.setInt(6, notification.getIsRead());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    notification.setNotificationId(rs.getLong(1));
                }
            }

            return notification;
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    public int CreateForAllActiveUsers(String type, String title, String message, Long referenceId) {
        String sql = """
                INSERT INTO notification (user_id, type, title, message, reference_id, is_read)
                SELECT id, ?, ?, ?, ?, 0
                FROM `user`
                WHERE is_active = 1
                  AND COALESCE(user_type, 'buyer') <> 'admin'
                """;

        return executeBulkInsert(sql, normalizeType(type), title, message, referenceId);
    }

    public int CreateForShopFollowers(long shopId, String type, String title, String message, Long referenceId) {
        String sql = """
                INSERT INTO notification (user_id, type, title, message, reference_id, is_read)
                SELECT sf.user_id, ?, ?, ?, ?, 0
                FROM shop_follower sf
                JOIN `user` u ON u.id = sf.user_id
                WHERE sf.shop_id = ?
                  AND u.is_active = 1
                """;

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, normalizeType(type));
            ps.setString(2, title);
            ps.setString(3, message);
            if (referenceId == null) {
                ps.setNull(4, java.sql.Types.BIGINT);
            } else {
                ps.setLong(4, referenceId);
            }
            ps.setLong(5, shopId);
            return ps.executeUpdate();
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return 0;
    }

    public List<Notification> GetByUserId(long userId) {
        String sql = """
                SELECT *
                FROM notification
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT 50
                """;

        List<Notification> notifications = new ArrayList<>();

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    notifications.add(rowMap(rs));
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return notifications;
    }

    public boolean MarkAsRead(long notificationId, long userId) {
        String sql = """
                UPDATE notification
                SET is_read = 1
                WHERE id = ? AND user_id = ?
                """;

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, notificationId);
            ps.setLong(2, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public int MarkAllAsRead(long userId) {
        String sql = """
                UPDATE notification
                SET is_read = 1
                WHERE user_id = ? AND is_read = 0
                """;

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            return ps.executeUpdate();
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return 0;
    }

    private int executeBulkInsert(String sql, String type, String title, String message, Long referenceId) {
        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, type);
            ps.setString(2, title);
            ps.setString(3, message);
            if (referenceId == null) {
                ps.setNull(4, java.sql.Types.BIGINT);
            } else {
                ps.setLong(4, referenceId);
            }
            return ps.executeUpdate();
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return 0;
    }

    private Notification rowMap(ResultSet rs) throws java.sql.SQLException {
        Notification notification = new Notification();
        notification.setNotificationId(rs.getLong("id"));
        notification.setUserId(rs.getLong("user_id"));
        notification.setType(rs.getString("type"));
        notification.setTitle(rs.getString("title"));
        notification.setMessage(rs.getString("message"));
        Object referenceId = rs.getObject("reference_id");
        notification.setReferenceId(referenceId == null ? null : ((Number) referenceId).longValue());
        notification.setRead(rs.getInt("is_read"));

        if (rs.getTimestamp("created_at") != null) {
            notification.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }

        return notification;
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return "system";
        }

        String value = type.trim().toLowerCase();
        if (value.equals("order") || value.equals("promotion") || value.equals("shop") || value.equals("system")) {
            return value;
        }

        return "system";
    }
}
