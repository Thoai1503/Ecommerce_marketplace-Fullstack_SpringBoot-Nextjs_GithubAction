package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Brand;

public class BrandRepository implements IRepositories<Brand> {

	private static BrandRepository instance = null;
	private DBConnection dbConnection;

	public BrandRepository() {
		this.dbConnection = DBConnection.getInstance();
	}

	public static BrandRepository Instance() {
		if (instance == null) {
			instance = new BrandRepository();
		}
		return instance;
	}

	// ================= CREATE =================
	@Override
	public Brand Create(Brand item) throws SQLException {

		String sql = """
				    INSERT INTO brand
				    (name, slug, logo, status)
				    VALUES (?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setString(1, item.getName());
			ps.setString(2, item.getSlug());
			ps.setString(3, item.getLogo());
			ps.setInt(4, item.getStatus() != null ? item.getStatus() : 1);

			int rows = ps.executeUpdate();

			if (rows > 0) {
				try (ResultSet rs = ps.getGeneratedKeys()) {
					if (rs.next()) {
						item.setId(rs.getInt(1));
					}
				}
				return item;
			}
		}

		return null;
	}

	// ================= UPDATE =================
	@Override
	public Brand Update(Brand item) {

		String sql = """
				    UPDATE brand
				    SET name=?,
				        slug=?,
				        logo=?,
				        status=?
				    WHERE id=?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, item.getName());
			ps.setString(2, item.getSlug());
			ps.setString(3, item.getLogo());
			ps.setInt(4, item.getStatus() != null ? item.getStatus() : 1);
			ps.setInt(5, item.getId());

			int rows = ps.executeUpdate();

			if (rows > 0) {
				return GetById(item.getId());
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	// ================= DELETE =================
	@Override
	public boolean Delete(int id) {

		String sql = "DELETE FROM brand WHERE id=?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return false;
	}

	// ================= GET ALL =================
	@Override
	public List<Brand> GetAll() {

		List<Brand> list = new ArrayList<>();

		String sql = "SELECT * FROM brand ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			while (rs.next()) {

				Brand b = new Brand();

				b.setId(rs.getInt("id"));
				b.setName(rs.getString("name"));
				b.setSlug(rs.getString("slug"));
				b.setLogo(rs.getString("logo"));
				b.setStatus(rs.getInt("status"));

				list.add(b);
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return list;
	}

	// ================= GET BY ID =================
	@Override
	public Brand GetById(int id) {

		String sql = "SELECT * FROM brand WHERE id=?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);

			try (ResultSet rs = ps.executeQuery()) {

				if (rs.next()) {

					Brand b = new Brand();

					b.setId(rs.getInt("id"));
					b.setName(rs.getString("name"));
					b.setSlug(rs.getString("slug"));
					b.setLogo(rs.getString("logo"));
					b.setStatus(rs.getInt("status"));

					return b;
				}
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	public List<Map<String, Object>> query(String sql, Object... params) {

		List<Map<String, Object>> list = new ArrayList<>();

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			for (int i = 0; i < params.length; i++) {
				ps.setObject(i + 1, params[i]);
			}

			ResultSet rs = ps.executeQuery();
			ResultSetMetaData meta = rs.getMetaData();

			while (rs.next()) {

				Map<String, Object> row = new HashMap<>();

				for (int i = 1; i <= meta.getColumnCount(); i++) {
					row.put(meta.getColumnName(i), rs.getObject(i));
				}

				list.add(row);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}
}