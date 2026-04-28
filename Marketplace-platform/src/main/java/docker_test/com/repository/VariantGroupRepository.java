package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.product.VariantGroup;

public class VariantGroupRepository {
    private static VariantGroupRepository instance;
    private final DBConnection dbConnection;

    private VariantGroupRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static VariantGroupRepository Instance() {
        if (instance == null) {
            instance = new VariantGroupRepository();
        }
        return instance;
    }

    public VariantGroup Create(VariantGroup item) throws SQLException {
        String sql = """
            INSERT INTO variant_group (product_id, group_name, sort_order, is_active)
            VALUES (?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, item.getProduct_id());
            ps.setString(2, item.getGroup_name());
            ps.setInt(3, item.getSort_order() != null ? item.getSort_order() : 1);
            ps.setInt(4, item.getIs_active() != null ? item.getIs_active() : 1);

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        item.setId(rs.getLong(1));
                    }
                }
                return item;
            }
        }

        return null;
    }

    public List<VariantGroup> GetByProductId(long productId) {
        String sql = "SELECT * FROM variant_group WHERE product_id = ? AND is_active = 1 ORDER BY sort_order, id";
        List<VariantGroup> list = new ArrayList<>();

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, productId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                VariantGroup g = new VariantGroup();
                g.setId(rs.getLong("id"));
                g.setProduct_id(rs.getLong("product_id"));
                g.setGroup_name(rs.getString("group_name"));
                g.setSort_order(rs.getInt("sort_order"));
                g.setIs_active(rs.getInt("is_active"));
                if (rs.getTimestamp("created_at") != null) {
                    g.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
                }
                if (rs.getTimestamp("updated_at") != null) {
                    g.setUpdated_at(rs.getTimestamp("updated_at").toLocalDateTime());
                }
                list.add(g);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return list;
    }
}
