package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.CategoryAttributeMapper;
import docker_test.com.models.CategoryAttribute;

public class CategoryAttributeRepository {

    private static CategoryAttributeRepository instance;

    public static CategoryAttributeRepository Instance() {
        if (instance == null) {
            instance = new CategoryAttributeRepository();
        }
        return instance;
    }

    private CategoryAttributeRepository() {}

    // ================= GET ALL =================
    public List<CategoryAttribute> GetAll() {
        List<CategoryAttribute> list = new ArrayList<>();
        String sql = "SELECT * FROM category_attribute";

        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(CategoryAttributeMapper.map(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // ================= GET BY ID =================
    public CategoryAttribute GetById(int id) {
        String sql = "SELECT * FROM category_attribute WHERE id = ?";

        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return CategoryAttributeMapper.map(rs);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    // ================= GET BY CATEGORY =================
    public List<CategoryAttribute> GetByCategoryId(long categoryId) {
        List<CategoryAttribute> list = new ArrayList<>();
        String sql = "SELECT * FROM category_attribute WHERE category_id = ?";

        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, categoryId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(CategoryAttributeMapper.map(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // ================= CREATE =================
    public CategoryAttribute Create(CategoryAttribute item) throws SQLException {

        // check duplicate
        String checkSql = "SELECT id FROM category_attribute WHERE category_id = ? AND attribute_id = ?";
        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(checkSql)) {

            ps.setLong(1, item.getCategoryId());
            ps.setInt(2, item.getAttributeId());
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                throw new SQLException("Duplicate category_attribute");
            }
        }

        String sql = "INSERT INTO category_attribute (category_id, attribute_id, status) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, item.getCategoryId());
            ps.setInt(2, item.getAttributeId());
            ps.setInt(3, item.getStatus());

            int affected = ps.executeUpdate();

            if (affected > 0) {
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next()) {
                    item.setId(keys.getInt(1));
                }
                return item;
            }
        }

        throw new SQLException("Insert failed");
    }

    // ================= UPDATE =================
    public CategoryAttribute Update(CategoryAttribute item) throws SQLException {

        String sql = "UPDATE category_attribute SET category_id = ?, attribute_id = ?, status = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, item.getCategoryId());
            ps.setInt(2, item.getAttributeId());
            ps.setInt(3, item.getStatus());
            ps.setInt(4, item.getId());

            int affected = ps.executeUpdate();

            if (affected > 0) {
                return item;
            }
        }

        throw new SQLException("Update failed");
    }

    // ================= DELETE =================
    public boolean Delete(int id) {
        String sql = "DELETE FROM category_attribute WHERE id = ?";

        try (Connection conn = DBConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }
}