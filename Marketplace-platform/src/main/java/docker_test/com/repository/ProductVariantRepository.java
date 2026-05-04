package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.product.ProductVariant;

@Repository
public class ProductVariantRepository implements IRepositories<ProductVariant> {
    private static ProductVariantRepository instance = null;
    private final DBConnection dbConnection;

    public static ProductVariantRepository Instance() {
        if (instance == null) {
            instance = new ProductVariantRepository();
        }
        return instance;
    }

    public ProductVariantRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    @Override
    public boolean Delete(int id) {
        String sql = "UPDATE product_variant SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return false;
    }

    public List<ProductVariant> GetByProductId(int productId) {
        List<ProductVariant> list = new ArrayList<>();
        String sql = "SELECT * FROM product_variant WHERE product_id = ? ORDER BY id ASC";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(mapVariant(rs));
            }
            return list;
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return List.of();
    }

    @Override
    public ProductVariant Create(ProductVariant item) throws SQLException {
        String sql = """
            INSERT INTO product_variant
                (product_id, variant_name, sku, price, stock_quantity, width, weight, height, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, item.getProduct_id());
            ps.setString(2, item.getVariant_name());
            ps.setString(3, item.getSku());
            ps.setObject(4, item.getPrice());
            ps.setInt(5, item.getStock_quantity());
            ps.setObject(6, item.getWidth());
            ps.setObject(7, item.getWeight());
            ps.setObject(8, item.getHeight());
            ps.setString(9, item.getImage_url());

            int affectedRows = ps.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        item.setVariant_id(keys.getInt(1));
                        return GetById(item.getId());
                    }
                }
                return item;
            }
        } catch (SQLException ex) {
            if (isIntegrityViolation(ex)) {
                throw new DataIntegrityViolationException(ex.getMessage(), ex);
            }
            throw ex;
        }
        return null;
    }

    @Override
    public ProductVariant Update(ProductVariant item) {
        String sql = """
            UPDATE product_variant SET
                variant_name = COALESCE(?, variant_name),
                sku = COALESCE(?, sku),
                price = COALESCE(?, price),
                stock_quantity = COALESCE(?, stock_quantity),
                width = COALESCE(?, width),
                weight = COALESCE(?, weight),
                height = COALESCE(?, height),
                image_url = COALESCE(?, image_url),
                is_active = COALESCE(?, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, item.getVariant_name());
            ps.setString(2, item.getSku());
            ps.setObject(3, item.getPrice());
            ps.setObject(4, item.getStock_quantity());
            ps.setObject(5, item.getWidth());
            ps.setObject(6, item.getWeight());
            ps.setObject(7, item.getHeight());
            ps.setString(8, item.getImage_url());
            ps.setObject(9, item.isActive());
            ps.setInt(10, item.getId());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                return GetById(item.getId());
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    public ProductVariant ToggleActive(int id) {
        String sql = """
            UPDATE product_variant
            SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            int rows = ps.executeUpdate();
            if (rows > 0) {
                return GetById(id);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    public boolean ProductExists(int productId) {
        String sql = "SELECT 1 FROM product WHERE id = ? LIMIT 1";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            ResultSet rs = ps.executeQuery();
            return rs.next();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return false;
    }

    public boolean BelongsToProduct(int variantId, int productId) {
        String sql = "SELECT 1 FROM product_variant WHERE id = ? AND product_id = ? LIMIT 1";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, variantId);
            ps.setInt(2, productId);
            ResultSet rs = ps.executeQuery();
            return rs.next();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return false;
    }

    @Override
    public List<ProductVariant> GetAll() {
        List<ProductVariant> list = new ArrayList<>();
        String sql = "SELECT * FROM product_variant ORDER BY id ASC";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapVariant(rs));
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return list;
    }

    @Override
    public ProductVariant GetById(int id) {
        String sql = "SELECT * FROM product_variant WHERE id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapVariant(rs);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    private ProductVariant mapVariant(ResultSet rs) throws SQLException {
        ProductVariant v = new ProductVariant();
        v.setVariant_id(rs.getInt("id"));
        v.setProduct_id(rs.getInt("product_id"));
        v.setVariant_name(rs.getString("variant_name"));
        v.setSku(rs.getString("sku"));
        v.setPrice(rs.getDouble("price"));
        v.setStock_quantity(rs.getInt("stock_quantity"));
        v.setWidth(nullableLong(rs, "width"));
        v.setWeight(nullableLong(rs, "weight"));
        v.setHeight(nullableLong(rs, "height"));
        v.setImage_url(rs.getString("image_url"));
        v.setActive(rs.getInt("is_active"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            v.setCreated_at(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            v.setUpdated_at(updatedAt.toLocalDateTime());
        }
        return v;
    }

    private Long nullableLong(ResultSet rs, String columnName) throws SQLException {
        long value = rs.getLong(columnName);
        return rs.wasNull() ? null : value;
    }

    private boolean isIntegrityViolation(SQLException ex) {
        String sqlState = ex.getSQLState();
        return sqlState != null && sqlState.startsWith("23");
    }
}
