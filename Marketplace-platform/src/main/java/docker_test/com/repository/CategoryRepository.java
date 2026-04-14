package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import docker_test.com.configs.DBConnection;
import docker_test.com.models.Category;

public class CategoryRepository implements IRepositories<Category> {

	private static CategoryRepository instance = null;
	private DBConnection dbConnection;

	public CategoryRepository() {
		this.dbConnection = DBConnection.getInstance();
	}

	public static CategoryRepository Instance() {
		if (instance == null) {
			instance = new CategoryRepository();
		}
		return instance;
	}

	// ================= CREATE =================

	@Override
	public Category Create(Category item) throws SQLException {

		String sql = """
				    INSERT INTO category
				    (parent_id, category_name, category_slug, category_icon, level, is_active)
				    VALUES (?, ?, ?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setInt(1, item.getParent_id() != null ? item.getParent_id() : 0);
			ps.setString(2, item.getCategory_name());
			ps.setString(3, item.getCategory_slug());
			ps.setString(4, item.getCategory_icon());
			ps.setInt(5, item.getLevel() != null ? item.getLevel() : 0);
			ps.setInt(6, item.getIs_active() != null ? item.getIs_active() : 1);

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
	public Category Update(Category item) {

		String sql = """
				    UPDATE category
				    SET category_name=?,
				        category_slug=?,
				        category_icon=?,
				        is_active=?,
				        updated_at=NOW()
				    WHERE id=?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, item.getCategory_name());
			ps.setString(2, item.getCategory_slug());
			ps.setString(3, item.getCategory_icon());
			ps.setInt(4, item.getIs_active() != null ? item.getIs_active() : 1);
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

		String sql = "DELETE FROM category WHERE id=?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);

			int rows = ps.executeUpdate();

			return rows > 0;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return false;
	}

	// ================= GET ALL =================

	@Override
	public List<Category> GetAll() {

		List<Category> list = new ArrayList<>();

		String sql = "SELECT * FROM category ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			while (rs.next()) {

				Category ca = new Category();

				ca.setId(rs.getInt("id"));
				ca.setParent_id(rs.getInt("parent_id"));
				ca.setCategory_name(rs.getString("category_name"));
				ca.setCategory_slug(rs.getString("category_slug"));
				ca.setCategory_icon(rs.getString("category_icon"));
				ca.setLevel(rs.getInt("level"));
				ca.setIs_active(rs.getInt("is_active"));

				if (rs.getTimestamp("created_at") != null) {
					ca.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
				}

				if (rs.getTimestamp("updated_at") != null) {
					ca.setUpdated_at(rs.getTimestamp("updated_at").toLocalDateTime());
				}

				list.add(ca);
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return list;
	}

	// ================= GET BY ID =================

	@Override
	public Category GetById(int id) {

		String sql = "SELECT * FROM category WHERE id=?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);

			try (ResultSet rs = ps.executeQuery()) {

				if (rs.next()) {

					Category ca = new Category();

					ca.setId(rs.getInt("id"));
					ca.setParent_id(rs.getInt("parent_id"));
					ca.setCategory_name(rs.getString("category_name"));
					ca.setCategory_slug(rs.getString("category_slug"));
					ca.setCategory_icon(rs.getString("category_icon"));
					ca.setLevel(rs.getInt("level"));
					ca.setIs_active(rs.getInt("is_active"));

					if (rs.getTimestamp("created_at") != null) {
						ca.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
					}

					if (rs.getTimestamp("updated_at") != null) {
						ca.setUpdated_at(rs.getTimestamp("updated_at").toLocalDateTime());
					}

					return ca;
				}
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	public List<Category> GetByParent(int parentId) {

		List<Category> list = new ArrayList<>();

		String sql = "SELECT * FROM category WHERE parent_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, parentId);

			ResultSet rs = ps.executeQuery();

			while (rs.next()) {

				Category ca = new Category();

				ca.setId(rs.getInt("id"));
				ca.setParent_id(rs.getInt("parent_id"));
				ca.setCategory_name(rs.getString("category_name"));
				ca.setCategory_slug(rs.getString("category_slug"));
				ca.setCategory_icon(rs.getString("category_icon"));
				ca.setLevel(rs.getInt("level"));
				ca.setIs_active(rs.getInt("is_active"));

				list.add(ca);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}
	
	public List<Map<String, Object>> query(String sql, Object... params) {

	    List<Map<String, Object>> list = new ArrayList<>();

	    try (
	        Connection con = dbConnection.getConn();
	        PreparedStatement ps = con.prepareStatement(sql)
	    ) {

	        for (int i = 0; i < params.length; i++) {
	            ps.setObject(i + 1, params[i]);
	        }

	        ResultSet rs = ps.executeQuery();
	        var meta = rs.getMetaData();

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
