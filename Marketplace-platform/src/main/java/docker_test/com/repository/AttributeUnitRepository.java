package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.attribute.AttributeUnitMapper;
import docker_test.com.models.attribute.AttributeUnit;

public class AttributeUnitRepository {

	private static AttributeUnitRepository instance;

	public static AttributeUnitRepository Instance() {
		if (instance == null)
			instance = new AttributeUnitRepository();
		return instance;
	}

	private final DBConnection dbConnection = DBConnection.getInstance();

	private AttributeUnitRepository() {
	}

	// ================= GET ALL =================
	public List<AttributeUnit> GetAll() {
		List<AttributeUnit> list = new ArrayList<>();
		String sql = "SELECT * FROM attribute_unit";

		try (Connection conn = dbConnection.getConn();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			while (rs.next()) {
				list.add(AttributeUnitMapper.map(rs));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}

	// ================= GET BY ID =================
	public AttributeUnit GetById(int id) {
		String sql = "SELECT * FROM attribute_unit WHERE id = ?";

		try (Connection conn = dbConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return AttributeUnitMapper.map(rs);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

	// ================= GET BY ATTRIBUTE =================
	public List<AttributeUnit> GetByAttributeId(int attributeId) {
		List<AttributeUnit> list = new ArrayList<>();
		String sql = "SELECT * FROM attribute_unit WHERE attribute_id = ?";

		try (Connection conn = dbConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, attributeId);
			ResultSet rs = ps.executeQuery();

			while (rs.next()) {
				list.add(AttributeUnitMapper.map(rs));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}

	// ================= CREATE =================
	public AttributeUnit Create(AttributeUnit item) throws SQLException {

		String sql = "INSERT INTO attribute_unit(attribute_id, unit_id, status) VALUES (?, ?, ?)";

		try (Connection conn = dbConnection.getConn();
				PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			ps.setInt(1, item.getAttribute_id());
			ps.setInt(2, item.getUnit_id());
			ps.setInt(3, item.getStatus());

			int affected = ps.executeUpdate();

			if (affected > 0) {
				ResultSet keys = ps.getGeneratedKeys();
				if (keys.next()) {
					item.setId(keys.getInt(1)); // ✅ auto id
				}
				return item;
			}
		}

		throw new SQLException("Insert failed");
	}

	// ================= UPDATE =================
	public boolean Update(AttributeUnit item) {
		String sql = "UPDATE attribute_unit SET attribute_id = ?, unit_id = ?, status = ? WHERE id = ?";

		try (Connection conn = dbConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, item.getAttribute_id());
			ps.setInt(2, item.getUnit_id());
			ps.setInt(3, item.getStatus());
			ps.setInt(4, item.getId());

			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return false;
	}

	// ================= DELETE =================
	public boolean Delete(int id) {
		String sql = "DELETE FROM attribute_unit WHERE id = ?";

		try (Connection conn = dbConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return false;
	}
}