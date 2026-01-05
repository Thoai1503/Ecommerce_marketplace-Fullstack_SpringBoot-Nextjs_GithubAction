package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.User;

public class UserRepository implements IRepositories<User> {

	private static UserRepository instance = null;
	private DBConnection dbConnection;

	public UserRepository() {
		this.dbConnection = DBConnection.getInstance();
	}

	public static UserRepository Instance() {
		if (instance == null) {
			instance = new UserRepository();
		}
		return instance;
	}

	@Override
	public User Create(User item) throws SQLException {

		String sql = "INSERT INTO user "
				+ "(email, phone, password_hash, full_name, avatar_url, date_of_birth, gender, user_type, is_verified, is_active, created_at, updated_at) "
				+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setString(1, item.getEmail());
			ps.setString(2, item.getPhone());
			ps.setString(3, item.getPasswordHash());
			ps.setString(4, item.getFullName());
			ps.setString(5, item.getAvatarUrl());

			if (item.getDateOfBirth() != null) {
				ps.setDate(6, java.sql.Date.valueOf(item.getDateOfBirth()));
			} else {
				ps.setNull(6, java.sql.Types.DATE);
			}

			ps.setString(7, item.getGender());
			ps.setString(8, item.getUserType());
			ps.setInt(9, item.getIsVerified());
			ps.setInt(10, item.getIsActive());
			ps.setTimestamp(11, java.sql.Timestamp.valueOf(item.getCreatedAt()));
			ps.setTimestamp(12, java.sql.Timestamp.valueOf(item.getUpdatedAt()));

			int rows = ps.executeUpdate();

			if (rows > 0) {
				try (ResultSet rs = ps.getGeneratedKeys()) {
					if (rs.next()) {
						long id = rs.getLong(1);
						item.setUserId(id);
						System.out.println("ID user mới: " + id);
					}
				}
				return item;
			}
		} catch (Exception ex) {
			throw ex;
		}

		return null;
	}

	@Override
	public User Update(User item) {

		String sql = "UPDATE user SET " + "email = ?, phone = ?, full_name = ?, avatar_url = ?, "
				+ "date_of_birth = ?, gender = ?, user_type = ?, " + "is_verified = ?, is_active = ?, updated_at = ? "
				+ "WHERE user_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, item.getEmail());
			ps.setString(2, item.getPhone());
			ps.setString(3, item.getFullName());
			ps.setString(4, item.getAvatarUrl());

			if (item.getDateOfBirth() != null) {
				ps.setDate(5, java.sql.Date.valueOf(item.getDateOfBirth()));
			} else {
				ps.setNull(5, java.sql.Types.DATE);
			}

			ps.setString(6, item.getGender());
			ps.setString(7, item.getUserType());
			ps.setInt(8, item.getIsVerified());
			ps.setInt(9, item.getIsActive());
			ps.setTimestamp(10, java.sql.Timestamp.valueOf(LocalDateTime.now()));
			ps.setLong(11, item.getUserId());

			int rows = ps.executeUpdate();
			return rows > 0 ? item : null;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	@Override
	public boolean Delete(User item) {

		String sql = "DELETE FROM user WHERE user_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setLong(1, item.getUserId());
			return ps.executeUpdate() > 0;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return false;
	}

	@Override
	public User GetById(Object id) {

		String sql = "SELECT * FROM users WHERE user_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setLong(1, Long.parseLong(id.toString()));
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapUser(rs);
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	@Override
	public HashSet<User> GetAll() {

		HashSet<User> list = new HashSet<>();
		String sql = "SELECT * FROM user";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			while (rs.next()) {
				list.add(mapUser(rs));
			}
			return list;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	private User mapUser(ResultSet rs) throws SQLException {

		User u = new User();
		u.setUserId(rs.getLong("user_id"));
		u.setEmail(rs.getString("email"));
		u.setPhone(rs.getString("phone"));
		u.setPasswordHash(rs.getString("password_hash"));
		u.setFullName(rs.getString("full_name"));
		u.setAvatarUrl(rs.getString("avatar_url"));

		java.sql.Date dob = rs.getDate("date_of_birth");
		if (dob != null) {
			u.setDateOfBirth(dob.toLocalDate());
		}

		u.setGender(rs.getString("gender"));
		u.setUserType(rs.getString("user_type"));
		u.setIsVerified(rs.getInt("is_verified"));
		u.setIsActive(rs.getInt("is_active"));

		u.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
		u.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

		if (rs.getTimestamp("last_login") != null) {
			u.setLastLogin(rs.getTimestamp("last_login").toLocalDateTime());
		}

		return u;
	}
}
