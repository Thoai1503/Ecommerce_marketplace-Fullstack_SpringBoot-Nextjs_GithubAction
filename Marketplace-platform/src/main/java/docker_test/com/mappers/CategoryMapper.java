package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.models.Category;

public class CategoryMapper implements IMapper<Category> {

    @Override
    public Category RowMap(ResultSet rs) {

        Category category = new Category();

        try {

            category.setId(rs.getInt("id"));
            category.setParent_id(rs.getInt("parent_id"));
            category.setCategory_name(rs.getString("category_name"));
            category.setCategory_slug(rs.getString("category_slug"));
            category.setCategory_icon(rs.getString("category_icon"));
            category.setLevel(rs.getInt("level"));
            category.setIs_active(rs.getInt("is_active"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                category.setCreated_at(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                category.setUpdated_at(updatedAt.toLocalDateTime());
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return category;
    }

    @Override
    public List<Category> RowsMap(ResultSet rs) {

        List<Category> list = new ArrayList<>();

        try {

            while (rs.next()) {

                Category category = RowMap(rs);

                list.add(category);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    /* ================= REQUIRED BY IMapper ================= */

    @Override
    public Category mapRow(ResultSet rs, int rowNum) throws SQLException {

        return RowMap(rs);

    }
}