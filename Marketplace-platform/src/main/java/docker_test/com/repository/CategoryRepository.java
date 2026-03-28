package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

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

<<<<<<< HEAD
        try (
            Connection con = dbConnection.getConn();
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
        ) {
=======
	@Override
	public List<Category> GetAll() {
		System.out.println("Get all category...");
		List<Category> list = new ArrayList<Category>();
		String sql ="select * from category";
		
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				){
			  ResultSet rs =	ps.executeQuery();
			  
			  while (rs.next()) {
		             Category ca = new Category();
		             ca.setId(rs.getInt("id"));
		             ca.setParent_id(rs.getInt("parent_id"));
		             ca.setCategory_name(rs.getString("category_name"));
		             ca.setCategory_slug(rs.getString("category_slug"));
		             ca.setLevel(rs.getInt("level"));
		           ca.setIs_active(rs.getInt("is_active"));
		             list.add(ca);
		      }
			  return list;
			
		}
		catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return null;
	}
	@Override
	public Category GetById(int id) {
		// TODO Auto-generated method stub
		return null;
	}
>>>>>>> 2dd3107eb64965ef2f5db2a5a58f933e5d430ebf

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
            SET parent_id=?,
                category_name=?,
                category_slug=?,
                category_icon=?,
                level=?,
                is_active=?,
                updated_at=NOW()
            WHERE id=?
        """;

        try (
            Connection con = dbConnection.getConn();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {

            ps.setInt(1, item.getParent_id() != null ? item.getParent_id() : 0);
            ps.setString(2, item.getCategory_name());
            ps.setString(3, item.getCategory_slug());
            ps.setString(4, item.getCategory_icon());
            ps.setInt(5, item.getLevel() != null ? item.getLevel() : 0);
            ps.setInt(6, item.getIs_active() != null ? item.getIs_active() : 1);
            ps.setInt(7, item.getId());

            int rows = ps.executeUpdate();

            System.out.println("UPDATE ROWS = " + rows); // debug

            if (rows > 0) {

                return GetById(item.getId()); // trả dữ liệu mới từ DB

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

        try (
            Connection con = dbConnection.getConn();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {

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

        try (
            Connection con = dbConnection.getConn();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()
        ) {

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

        try (
            Connection con = dbConnection.getConn();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {

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
}