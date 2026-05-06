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
		String sql = "SELECT * FROM product_attribute WHERE product_id = ? ORDER BY id";

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
					insertPs.setObject(3, attribute.getAttributeValueId());
					insertPs.setString(4, attribute.getValueText());
					insertPs.setObject(5, attribute.getValueNumber());

					if (attribute.getValueDate() != null) {
						insertPs.setDate(6, Date.valueOf(attribute.getValueDate()));
					} else {
						insertPs.setNull(6, Types.DATE);
					}

					insertPs.setObject(7, attribute.getUnitId());
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
