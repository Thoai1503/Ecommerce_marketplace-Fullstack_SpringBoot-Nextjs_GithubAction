package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.product.VariantOption;

public class VariantOptionRepository {
    private static VariantOptionRepository instance;
    private final DBConnection dbConnection;

    private VariantOptionRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static VariantOptionRepository Instance() {
        if (instance == null) {
            instance = new VariantOptionRepository();
        }
        return instance;
    }

    public VariantOption Create(VariantOption item) throws SQLException {
        String sql = """
            INSERT INTO variant_option (variant_group_id, option_value, sort_order, image_url, is_active)
            VALUES (?, ?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, item.getVariant_group_id());
            ps.setString(2, item.getOption_value());
            ps.setInt(3, item.getSort_order() != null ? item.getSort_order() : 1);
            ps.setString(4, item.getImage_url());
            ps.setInt(5, item.getIs_active() != null ? item.getIs_active() : 1);

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

    public List<VariantOption> GetByGroupId(long groupId) {
        String sql = "SELECT * FROM variant_option WHERE variant_group_id = ? AND is_active = 1 ORDER BY sort_order, id";
        List<VariantOption> list = new ArrayList<>();

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, groupId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                VariantOption o = new VariantOption();
                o.setId(rs.getLong("id"));
                o.setVariant_group_id(rs.getLong("variant_group_id"));
                o.setOption_value(rs.getString("option_value"));
                o.setSort_order(rs.getInt("sort_order"));
                o.setImage_url(rs.getString("image_url"));
                o.setIs_active(rs.getInt("is_active"));
                if (rs.getTimestamp("created_at") != null) {
                    o.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
                }
                if (rs.getTimestamp("updated_at") != null) {
                    o.setUpdated_at(rs.getTimestamp("updated_at").toLocalDateTime());
                }
                list.add(o);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return list;
    }
}
