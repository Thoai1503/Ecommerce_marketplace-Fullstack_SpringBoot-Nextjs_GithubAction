package docker_test.com.repository;

import docker_test.com.configs.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProductStatusHistoryRepository {
    private static ProductStatusHistoryRepository instance;
    private final DBConnection dbConnection;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private ProductStatusHistoryRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static ProductStatusHistoryRepository Instance() {
        if (instance == null) {
            instance = new ProductStatusHistoryRepository();
        }
        return instance;
    }

    public void insert(
            long productId,
            String fromStatus,
            String toStatus,
            String reason,
            Long changedBy,
            String changedByRole
    ) {
        String sql = """
            INSERT INTO product_status_history
            (product_id, from_status, to_status, reason, changed_by, changed_by_role)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setString(2, fromStatus);
            ps.setString(3, toStatus);
            ps.setString(4, reason);
            if (changedBy != null) ps.setLong(5, changedBy);
            else ps.setNull(5, Types.BIGINT);
            ps.setString(6, changedByRole);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatusHistoryRepository.insert] failed: " + e.getMessage(), e);
        }
    }

    public List<Map<String, Object>> findByProductId(long productId) {
        String sql = """
            SELECT
                h.id,
                h.product_id,
                h.from_status,
                h.to_status,
                h.reason,
                h.changed_by,
                h.changed_by_role,
                h.changed_at,
                u.full_name AS changed_by_name
            FROM product_status_history h
            LEFT JOIN user u ON u.id = h.changed_by
            WHERE h.product_id = ?
            ORDER BY h.changed_at DESC, h.id DESC
        """;

        List<Map<String, Object>> rows = new ArrayList<>();
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id", rs.getLong("id"));
                    row.put("productId", rs.getLong("product_id"));
                    row.put("fromStatus", rs.getString("from_status"));
                    row.put("toStatus", rs.getString("to_status"));
                    row.put("reason", rs.getString("reason"));
                    long changedBy = rs.getLong("changed_by");
                    row.put("changedBy", rs.wasNull() ? null : changedBy);
                    row.put("changedByRole", rs.getString("changed_by_role"));
                    row.put("changedByName", rs.getString("changed_by_name"));
                    var changedAt = rs.getTimestamp("changed_at");
                    row.put("changedAt", changedAt != null ? changedAt.toLocalDateTime().format(ISO) : null);
                    rows.add(row);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatusHistoryRepository.findByProductId] failed: " + e.getMessage(), e);
        }
        return rows;
    }
}
