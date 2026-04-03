package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import docker_test.com.models.CategoryAttribute;

public class CategoryAttributeMapper {

    public static CategoryAttribute map(ResultSet rs) throws SQLException {
        CategoryAttribute ca = new CategoryAttribute();
        ca.setId(rs.getInt("id"));
        ca.setCategoryId(rs.getLong("category_id"));
        ca.setAttributeId(rs.getInt("attribute_id"));
        ca.setStatus(rs.getInt("status"));
        return ca;
    }
}