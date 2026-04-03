package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.attribute.AttributeValueMapper;
import docker_test.com.models.attribute.AttributeValue;

public class AttributeValueRepository {

	private static AttributeValueRepository instance;

	public static AttributeValueRepository Instance() {
		if (instance == null)
			instance = new AttributeValueRepository();
		return instance;
	}

	private AttributeValueRepository() {
	}

	// ================= GET ALL =================
	public List<AttributeValue> GetAll() {
		List<AttributeValue> list = new ArrayList<>();
		String sql = "SELECT * FROM attribute_value";

		try (Connection conn = DBConnection.getConn();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			while (rs.next()) {
				list.add(AttributeValueMapper.map(rs));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}

	// ================= GET BY ATTRIBUTE =================
	public List<AttributeValue> GetByAttributeId(int attributeId) {
		List<AttributeValue> list = new ArrayList<>();
		String sql = "SELECT * FROM attribute_value WHERE attribute_id = ?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, attributeId);
			ResultSet rs = ps.executeQuery();

			while (rs.next()) {
				list.add(AttributeValueMapper.map(rs));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}

	// ================= CREATE =================
	public AttributeValue Create(AttributeValue item) throws SQLException {

		// 🔥 tránh duplicate
		String checkSql = "SELECT id FROM attribute_value WHERE attribute_id = ? AND value = ?";
		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(checkSql)) {
			ps.setInt(1, item.getAttribute_id());
			ps.setString(2, item.getValue());

			ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				throw new SQLException("Duplicate value");
			}
		}

		String sql = "INSERT INTO attribute_value(attribute_id, unit_id, value) VALUES (?, ?, ?)";

		try (Connection conn = DBConnection.getConn();
				PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			ps.setInt(1, item.getAttribute_id());

			if (item.getUnit_id() == null) {
				ps.setNull(2, Types.INTEGER);
			} else {
				ps.setInt(2, item.getUnit_id());
			}

			ps.setString(3, item.getValue());

			int affected = ps.executeUpdate();

			if (affected > 0) {
				ResultSet keys = ps.getGeneratedKeys();
				if (keys.next())
					item.setId(keys.getInt(1));
				return item;
			}
		}

		throw new SQLException("Insert failed");
	}

	// ================= UPDATE =================
	public boolean Update(AttributeValue item) {
		String sql = "UPDATE attribute_value SET value = ?, unit_id = ? WHERE id = ?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setString(1, item.getValue());

			if (item.getUnit_id() == null) {
				ps.setNull(2, Types.INTEGER);
			} else {
				ps.setInt(2, item.getUnit_id());
			}

			ps.setInt(3, item.getId());

			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return false;
	}

	// ================= DELETE =================
	public boolean Delete(int id) {
		String sql = "DELETE FROM attribute_value WHERE id = ?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return false;
	}
}