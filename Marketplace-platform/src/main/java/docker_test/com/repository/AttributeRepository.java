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
import docker_test.com.mappers.attribute.AttributeMapper;
import docker_test.com.models.attribute.Attribute;

public class AttributeRepository implements IRepositories<Attribute> {

	
	private static AttributeRepository instance = null;
	private DBConnection dbConnection;
    private final AttributeMapper mapper;
	
	
	public AttributeRepository () {
		this.dbConnection= DBConnection.getInstance();
        this.mapper = new AttributeMapper();
	}
	public static AttributeRepository Instance() {
		if (instance==null) {
			instance=new AttributeRepository();
		}
		return instance;
	}
	
	
	@Override
    public Attribute Create(Attribute item) throws SQLException {

        String sql = """
            INSERT INTO attribute (name, slug, data_type)
            VALUES (?, ?, 0)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, item.getName());
            ps.setString(2, item.getSlug());
//            ps.setInt(3, item.getData_type());

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
    public Attribute Update(Attribute item) {

        String sql = """
            UPDATE attribute
            SET name = ?, slug = ?, data_type = 0, status = ?
            WHERE id = ?
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, item.getName());
            ps.setString(2, item.getSlug());
            ps.setInt(3, item.getStatus());

            return ps.executeUpdate() > 0 ? item : null;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


	@Override
    public boolean Delete(int id) {

        String sql = "UPDATE attribute SET status = 0 WHERE id = ?";

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
    public Attribute GetById(int id) {

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
    public List<Attribute> GetAll() {

        String sql = "SELECT * FROM attribute WHERE status = 1";

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
	
