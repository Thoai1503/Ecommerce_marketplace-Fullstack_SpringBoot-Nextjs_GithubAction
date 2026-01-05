package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.HashSet;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.UserMapper;
import docker_test.com.models.User;

public class UserRepository implements IRepositories<User> {

    private static UserRepository instance = null;
    private final DBConnection dbConnection;
    private final UserMapper userMapper;

    private UserRepository() {
        this.dbConnection = DBConnection.getInstance();
        this.userMapper = new UserMapper();
    }

    public static UserRepository Instance() {
        if (instance == null) {
            instance = new UserRepository();
        }
        return instance;
    }

    /* ================= CREATE ================= */
    @Override
    public User Create(User item) throws SQLException {

<<<<<<< HEAD
        String sql = """
            INSERT INTO user
            (email, phone, password_hash, full_name, avatar_url,
             date_of_birth, gender, user_type, is_verified, is_active,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
=======
		String sql = "INSERT INTO user "
				+ "(email, phone, password_hash, full_name, avatar_url, date_of_birth, gender, user_type, is_verified, is_active, created_at, updated_at) "
				+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
>>>>>>> 41a27d80fdc7380950e749ff5f8f44880e59e103

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
                        item.setUserId(rs.getLong(1));
                    }
                }
                return item;
            }
        }

        return null;
    }

    /* ================= UPDATE ================= */
    @Override
    public User Update(User item) {

<<<<<<< HEAD
        String sql = """
            UPDATE user SET
                email = ?, phone = ?, full_name = ?, avatar_url = ?,
                date_of_birth = ?, gender = ?, user_type = ?,
                is_verified = ?, is_active = ?, updated_at = ?
            WHERE user_id = ?
        """;
=======
		String sql = "UPDATE user SET " + "email = ?, phone = ?, full_name = ?, avatar_url = ?, "
				+ "date_of_birth = ?, gender = ?, user_type = ?, " + "is_verified = ?, is_active = ?, updated_at = ? "
				+ "WHERE user_id = ?";
>>>>>>> 41a27d80fdc7380950e749ff5f8f44880e59e103

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

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

            return ps.executeUpdate() > 0 ? item : null;

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    /* ================= DELETE ================= */
    @Override
    public boolean Delete(User item) {

<<<<<<< HEAD
        String sql = "DELETE FROM user WHERE user_id = ?";
=======
		String sql = "DELETE FROM user WHERE user_id = ?";
>>>>>>> 41a27d80fdc7380950e749ff5f8f44880e59e103

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, item.getUserId());
            return ps.executeUpdate() > 0;

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    /* ================= GET BY ID ================= */
    @Override
    public User GetById(Object id) {

        String sql = "SELECT * FROM user WHERE user_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, Long.parseLong(id.toString()));
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return userMapper.RowMap(rs);
            }

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    /* ================= GET ALL ================= */
    @Override
    public HashSet<User> GetAll() {

<<<<<<< HEAD
        String sql = "SELECT * FROM user";
=======
		HashSet<User> list = new HashSet<>();
		String sql = "SELECT * FROM user";
>>>>>>> 41a27d80fdc7380950e749ff5f8f44880e59e103

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return userMapper.RowsMap(rs);

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return new HashSet<>();
    }
}
