package docker_test.com.repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.UserMapper;
import docker_test.com.models.PageResult;
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
    
    /* ================= FILTER + SEARCH + PAGINATE ================= */

    /* ================= FILTER + PAGINATE ================= */

/* ================= FILTER + SEARCH + PAGINATE ================= */

public PageResult<User> Filter(
        String keyword,
        String userType,
        Integer isActive,
        int page,
        int pageSize
) {
	if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 20;
    List<Object> params = new ArrayList<>();

    StringBuilder where = new StringBuilder("WHERE 1=1 ");

    if (keyword != null && !keyword.isBlank()) {
        where.append("AND (email LIKE ? OR CAST(id AS CHAR) LIKE ? OR full_name LIKE ?) ");
        params.add("%" + keyword.trim() + "%");
        params.add("%" + keyword.trim() + "%");
        params.add("%" + keyword.trim() + "%");
    }

    if (userType != null && !userType.isBlank()) {
        where.append("AND user_type = ? ");
        params.add(userType);
    }

    if (isActive != null) {
        where.append("AND is_active = ? ");
        params.add(isActive);
    }

    String countSql = "SELECT COUNT(*) FROM `user` " + where;
    String dataSql  = "SELECT * FROM `user` " + where
                    + "ORDER BY created_at DESC LIMIT ? OFFSET ?";

    int offset = (page - 1) * pageSize;
    long total = 0;
    List<User> list = new ArrayList<>();

    try (Connection con = dbConnection.getConn()) {

        // đếm total
        try (PreparedStatement ps = con.prepareStatement(countSql)) {
            for (int i = 0; i < params.size(); i++)
                ps.setObject(i + 1, params.get(i));
            ResultSet rs = ps.executeQuery();
            if (rs.next()) total = rs.getLong(1);
        }

        // lấy data
        try (PreparedStatement ps = con.prepareStatement(dataSql)) {
            for (int i = 0; i < params.size(); i++)
                ps.setObject(i + 1, params.get(i));
            ps.setInt(params.size() + 1, pageSize);
            ps.setInt(params.size() + 2, offset);
            ResultSet rs = ps.executeQuery();
            list = mapper.RowsMap(rs);
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return new PageResult<>(list, total, page, pageSize);
}
    // helper bind dynamic params
    private int bindParams(PreparedStatement ps, List<Object> params, int startIdx) throws SQLException {
        int i = startIdx;
        for (Object p : params) {
            if (p instanceof String s) ps.setString(i, s);
            else if (p instanceof Integer n) ps.setInt(i, n);
            else ps.setObject(i, p);
            i++;
        }
        return i;
    }
}
	
