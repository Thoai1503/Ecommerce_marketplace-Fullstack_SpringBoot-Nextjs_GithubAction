package docker_test.com.repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.UserMapper;
import docker_test.com.models.User;

public class UserRepository implements IRepositories<User> {

    private static UserRepository instance;
    private final DBConnection dbConnection;
    private final UserMapper mapper = new UserMapper();

    private UserRepository() {
        this.dbConnection = DBConnection.getInstance();
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

        String sql = """
            INSERT INTO user
            (email, phone, password_hash, full_name, avatar_url,
             date_of_birth, gender, user_type, is_verified, is_active,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, item.getEmail());
            ps.setString(2, item.getPhone());
            ps.setString(3, item.getPasswordHash());
            ps.setString(4, item.getFullName());
            ps.setString(5, item.getAvatarUrl());

            if (item.getDateOfBirth() != null) {
                ps.setDate(6, Date.valueOf(item.getDateOfBirth()));
            } else {
                ps.setNull(6, Types.DATE);
            }

            ps.setString(7, item.getGender());
            ps.setString(8, item.getUserType());
            ps.setInt(9, item.getIsVerified());
            ps.setInt(10, item.getIsActive());
            ps.setTimestamp(11, Timestamp.valueOf(item.getCreatedAt()));
            ps.setTimestamp(12, Timestamp.valueOf(item.getUpdatedAt()));

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    item.setId(rs.getLong(1));
                }
            }
            return item;
        }
    }

    /* ================= GET BY ID ================= */

    @Override
    public User GetById(int id) {

        String sql = "SELECT * FROM user WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapper.RowMap(rs);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /* ================= GET ALL ================== */

    @Override
    public List<User> GetAll() {

        String sql = "SELECT * FROM user";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return mapper.RowsMap(rs);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return List.of();
    }

    /* ================= UPDATE ================= */

    @Override
    public User Update(User item) {

        String sql = """
            UPDATE user SET
                email = ?, phone = ?, full_name = ?, avatar_url = ?,
                date_of_birth = ?, gender = ?, user_type = ?,
                is_verified = ?, is_active = ?, updated_at = ?
            WHERE id = ?
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, item.getEmail());
            ps.setString(2, item.getPhone());
            ps.setString(3, item.getFullName());
            ps.setString(4, item.getAvatarUrl());

            if (item.getDateOfBirth() != null) {
                ps.setDate(5, Date.valueOf(item.getDateOfBirth()));
            } else {
                ps.setNull(5, Types.DATE);
            }

            ps.setString(6, item.getGender());
            ps.setString(7, item.getUserType());
            ps.setInt(8, item.getIsVerified());
            ps.setInt(9, item.getIsActive());
            ps.setTimestamp(10, Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(11, item.getId());

            return ps.executeUpdate() > 0 ? item : null;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /* ================= DELETE ================= */

    @Override
    public boolean Delete(int id) {

        String sql = "DELETE FROM user WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
		

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    /* ================= EXTRA ================= */

    public boolean updatePasswordHash(long userId, String newHash) {
        String sql = "UPDATE user SET password_hash = ?, updated_at = ? WHERE id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newHash);
            ps.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(3, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public boolean existsByEmail(String email) {

        String sql = "SELECT 1 FROM user WHERE email = ? LIMIT 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);
            return ps.executeQuery().next();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean existsByPhone(String phone) {
        String sql = "SELECT 1 FROM user WHERE phone = ? LIMIT 1";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, phone);
            return ps.executeQuery().next();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public User findByEmail(String email) {

        String sql = "SELECT * FROM user WHERE email = ? LIMIT 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapper.RowMap(rs);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
