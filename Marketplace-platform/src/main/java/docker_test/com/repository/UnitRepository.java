package docker_test.com.repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.UnitMapper;
import docker_test.com.models.Unit;

public class UnitRepository implements IRepositories<Unit> {

    private static UnitRepository instance;
    private final DBConnection dbConnection;
    private final UnitMapper mapper;

    public UnitRepository() {
        this.dbConnection = DBConnection.getInstance();
        this.mapper = new UnitMapper();
    }

    public static synchronized UnitRepository Instance() {
        if (instance == null) {
            instance = new UnitRepository();
        }
        return instance;
    }

    // ================= CREATE =================
    @Override
    public Unit Create(Unit item) throws SQLException {

        String sql = """
            INSERT INTO unit (label, symbol, status)
            VALUES (?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, item.getLabel());
            ps.setString(2, item.getSymbol());
            ps.setInt(3, item.getStatus());

            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                item.setId(rs.getInt(1));
            }

            return item;
        }
    }

    // ================= UPDATE =================
    @Override
    public Unit Update(Unit item) {

        String sql = """
            UPDATE unit
            SET label = ?, symbol = ?, status = ?
            WHERE id = ?
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, item.getLabel());
            ps.setString(2, item.getSymbol());
            ps.setInt(3, item.getStatus());
            ps.setInt(4, item.getId());

            return ps.executeUpdate() > 0 ? item : null;

        } catch (Exception e) {
            throw new RuntimeException("Update unit failed", e);
        }
    }

    // ================= DELETE (SOFT) =================
    @Override
    public boolean Delete(int id) {

        String sql = "DELETE FROM unit WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            throw new RuntimeException("Delete unit failed", e);
        }
    }

    // ================= GET BY ID =================
    @Override
    public Unit GetById(int id) {

        String sql = "SELECT * FROM unit WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapper.RowMap(rs);
            }

        } catch (Exception e) {
            throw new RuntimeException("Get unit by id failed", e);
        }
        return null;
    }

    // ================= GET ALL =================
    @Override
    public List<Unit> GetAll() {

        String sql = "SELECT * FROM unit ORDER BY id ASC";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return mapper.RowsMap(rs);

        } catch (Exception e) {
            throw new RuntimeException("Get all units failed", e);
        }
    }

    // ================= GET BY SYMBOL =================
    public Unit getBySymbol(String symbol) {

        String sql = "SELECT * FROM unit WHERE symbol = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, symbol);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapper.RowMap(rs);
            }

        } catch (Exception e) {
            throw new RuntimeException("Get unit by symbol failed", e);
        }
        return null;
    }
}