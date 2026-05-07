package docker_test.com.repository;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.product.ProductAttributeMapper;
import docker_test.com.models.product.ProductAttribute;

public class ProductAttributeRepository {

	private static ProductAttributeRepository instance;
	private final DBConnection dbConnection;

	public static ProductAttributeRepository Instance() {
		if (instance == null) {
			instance = new ProductAttributeRepository();
		}
		return instance;
	}

	private ProductAttributeRepository() {
		this.dbConnection = DBConnection.getInstance();
	}

	public List<ProductAttribute> GetByProductId(int productId) {
		List<ProductAttribute> list = new ArrayList<>();
		String sql = """
				SELECT
				    pa.*,
				    a.name AS attribute_name,
				    a.slug AS attribute_slug,
				    av.value AS attribute_value,
				    u.label AS unit_label,
				    u.symbol AS unit_symbol
				FROM product_attribute pa
				LEFT JOIN attribute a ON pa.attribute_id = a.id
				LEFT JOIN attribute_value av ON pa.attribute_value_id = av.id
				LEFT JOIN unit u ON pa.unit_id = u.id
				WHERE pa.product_id = ?
				ORDER BY pa.id
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, productId);

			try (ResultSet rs = ps.executeQuery()) {
				ProductAttributeMapper mapper = new ProductAttributeMapper();
				list = mapper.RowsMap(rs);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}

	public List<ProductAttribute> ReplaceByProductId(int productId, List<ProductAttribute> attributes)
			throws SQLException {
		String deleteSql = "DELETE FROM product_attribute WHERE product_id = ?";
		String insertSql = """
				INSERT INTO product_attribute
				    (product_id, attribute_id, attribute_value_id, value_text, value_number, value_date, unit_id)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn()) {
			if (con == null) {
				throw new SQLException("Unable to obtain database connection");
			}

			boolean previousAutoCommit = con.getAutoCommit();
			con.setAutoCommit(false);

			try (PreparedStatement deletePs = con.prepareStatement(deleteSql);
					PreparedStatement insertPs = con.prepareStatement(insertSql)) {

				deletePs.setInt(1, productId);
				deletePs.executeUpdate();

				for (ProductAttribute attribute : attributes) {
					if (attribute == null || attribute.getAttributeId() <= 0) {
						continue;
					}

					insertPs.setInt(1, productId);
					insertPs.setInt(2, attribute.getAttributeId());
					if (attribute.getAttributeValueId() != null) {
						insertPs.setInt(3, attribute.getAttributeValueId());
					} else {
						insertPs.setNull(3, Types.INTEGER);
					}
					insertPs.setString(4, attribute.getValueText());
					if (attribute.getValueNumber() != null) {
						insertPs.setDouble(5, attribute.getValueNumber());
					} else {
						insertPs.setNull(5, Types.DECIMAL);
					}

					if (attribute.getValueDate() != null) {
						insertPs.setDate(6, Date.valueOf(attribute.getValueDate()));
					} else {
						insertPs.setNull(6, Types.DATE);
					}

					if (attribute.getUnitId() != null) {
						insertPs.setInt(7, attribute.getUnitId());
					} else {
						insertPs.setNull(7, Types.INTEGER);
					}
					insertPs.addBatch();
				}

				insertPs.executeBatch();
				con.commit();
			} catch (Exception e) {
				con.rollback();
				throw new SQLException(e);
			} finally {
				con.setAutoCommit(previousAutoCommit);
			}
		}

		return GetByProductId(productId);
	}
}
