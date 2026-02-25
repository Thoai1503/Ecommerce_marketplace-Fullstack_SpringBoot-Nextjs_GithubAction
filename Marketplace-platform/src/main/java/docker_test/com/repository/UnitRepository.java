package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.UnitMapper;
import docker_test.com.models.Unit;

public class UnitRepository implements IRepositories<Unit> {

	
	private static UnitRepository instance=null;
	private DBConnection dbConnection;
    private final UnitMapper mapper;
	
	
	public UnitRepository () {
		this.dbConnection= DBConnection.getInstance();
        this.mapper = new UnitMapper();
	}
	public static UnitRepository Instance() {
		if (instance==null) {
			instance=new UnitRepository();
		}
		return instance;
	}
	
	
	@Override
    public Unit Create(Unit item) throws SQLException {

        String sql = """
            INSERT INTO unit (label, symbol)
            VALUES (?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, item.getLabel());
            ps.setString(2, item.getSymbol());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    item.setId(rs.getInt(1));
                }
            }
            return item;
        }
    }

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
            e.printStackTrace();
        }
        return null;
    }


	@Override
    public boolean Delete(int id) {

        String sql = "UPDATE unit SET status = 0 WHERE id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

	@Override
    public Unit GetById(int id) {

        String sql = "SELECT * FROM unit WHERE id = ? AND status = 1";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

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


	@Override
    public List<Unit> GetAll() {

        String sql = "SELECT * FROM unit WHERE status = 1";

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
	
