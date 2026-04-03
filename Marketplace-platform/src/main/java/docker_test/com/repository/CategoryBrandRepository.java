package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.CategoryBrand;

public class CategoryBrandRepository implements IRepositories<CategoryBrand> {

	private static CategoryBrandRepository instance;

	public static CategoryBrandRepository Instance() {
		if (instance == null) {
			instance = new CategoryBrandRepository();
		}
		return instance;
	}

	private CategoryBrandRepository() {
	}

	// ===== MAP =====
	private CategoryBrand map(ResultSet rs) throws SQLException {
		return new CategoryBrand(rs.getInt("id"), rs.getInt("category_id"), rs.getInt("brand_id"), rs.getInt("status"));
	}

	// ===== GET ALL =====
	@Override
	public List<CategoryBrand> GetAll() {
		List<CategoryBrand> list = new ArrayList<>();
		String sql = "SELECT * FROM category_brand";

		try (Connection conn = DBConnection.getConn();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			while (rs.next()) {
				list.add(map(rs));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}

	// ===== GET BY ID =====
	@Override
	public CategoryBrand GetById(int id) {
		String sql = "SELECT * FROM category_brand WHERE id = ?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {

			ps.setInt(1, id);

			ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				return map(rs);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

	// ===== CREATE =====
	@Override
	public CategoryBrand Create(CategoryBrand item) throws SQLException {
		String sql = "INSERT INTO category_brand (category_id, brand_id, status) VALUES (?, ?, ?)";

		try (Connection conn = DBConnection.getConn();
				PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setInt(1, item.getCategory_id());
			ps.setInt(2, item.getBrand_id());
			ps.setInt(3, item.getStatus() != null ? item.getStatus() : 1);

			int affected = ps.executeUpdate();

			if (affected > 0) {
				ResultSet keys = ps.getGeneratedKeys();
				if (keys.next()) {
					item.setId(keys.getInt(1));
				}
				return item;
			}
		}

		throw new SQLException("Create failed");
	}

	// ===== UPDATE =====
	@Override
	public CategoryBrand Update(CategoryBrand item) {
		String sql = "UPDATE category_brand SET category_id=?, brand_id=?, status=? WHERE id=?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {

			ps.setInt(1, item.getCategory_id());
			ps.setInt(2, item.getBrand_id());
			ps.setInt(3, item.getStatus());
			ps.setInt(4, item.getId());

			int affected = ps.executeUpdate();

			if (affected > 0)
				return item;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

	// ===== DELETE =====
	@Override
	public boolean Delete(int id) {
		String sql = "DELETE FROM category_brand WHERE id = ?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return false;
	}

	// ===== TOGGLE STATUS =====
	public boolean ToggleStatus(int id) {
		String sql = "UPDATE category_brand SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END WHERE id = ?";

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return false;
	}

	public List<CategoryBrand> GetByCategoryId(int categoryId) {
		String sql = "SELECT * FROM category_brand WHERE category_id = ?";
		List<CategoryBrand> list = new ArrayList<>();

		try (Connection conn = DBConnection.getConn(); PreparedStatement ps = conn.prepareStatement(sql)) {

			ps.setInt(1, categoryId);

			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				list.add(map(rs));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return list;
	}
}