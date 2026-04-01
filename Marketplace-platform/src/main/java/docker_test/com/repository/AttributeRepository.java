package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.attribute.AttributeMapper;
import docker_test.com.models.attribute.Attribute;

public class AttributeRepository implements IRepositories<Attribute> {

	private static AttributeRepository instance = null;
	private final DBConnection dbConnection;
	private final AttributeMapper mapper;

	public AttributeRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new AttributeMapper();
	}

	public static AttributeRepository Instance() {
		if (instance == null) {
			instance = new AttributeRepository();
		}
		return instance;
	}

	// ================= CREATE =================
	@Override
	public Attribute Create(Attribute item) throws SQLException {

		String sql = """
				    INSERT INTO attribute (name, slug, status)
				    VALUES (?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setString(1, item.getName());
			ps.setString(2, item.getSlug());
			ps.setInt(3, item.getStatus());

			ps.executeUpdate();

			try (ResultSet rs = ps.getGeneratedKeys()) {
				if (rs.next()) {
					item.setId(rs.getInt(1));
				}
			}

			return item;
		}
	}

	// ================= UPDATE =================
	@Override
	public Attribute Update(Attribute item) {

		String sql = """
				    UPDATE attribute
				    SET name = ?, slug = ?, status = ?
				    WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, item.getName());
			ps.setString(2, item.getSlug());
			ps.setInt(3, item.getStatus());
			ps.setInt(4, item.getId());

			return ps.executeUpdate() > 0 ? item : null;

		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	// ================= DELETE =================
	@Override
	public boolean Delete(int id) {

	    String sql = "DELETE FROM attribute WHERE id = ?";

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql)) {

	        ps.setInt(1, id);
	        return ps.executeUpdate() > 0;

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    return false;
	}
	// ================= GET BY ID =================
	@Override
	public Attribute GetById(int id) {

		String sql = "SELECT * FROM attribute WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	// ================= GET ALL =================
	@Override
	public List<Attribute> GetAll() {

		String sql = "SELECT * FROM attribute";
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			e.printStackTrace();
		}
		return new ArrayList<>();
	}
}
