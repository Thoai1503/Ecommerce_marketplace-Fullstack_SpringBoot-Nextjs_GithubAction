package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.ShopMapper;
import docker_test.com.models.Shop;

public class ShopRepository implements IRepositories<Shop> {

    private static ShopRepository instance = null;
    private final DBConnection dbConnection;
    private final ShopMapper shopMapper;

    private ShopRepository() {
        this.dbConnection = DBConnection.getInstance();
        this.shopMapper = new ShopMapper();
    }

    public static ShopRepository Instance() {
        if (instance == null) {
            instance = new ShopRepository();
        }
        return instance;
    }

    /* ================= CREATE ================= */
    @Override
    public Shop Create(Shop item) throws SQLException {

        String sql = """
            INSERT INTO shop
            (user_id, shop_name, shop_description,
             shop_logo, shop_banner,
             business_license, tax_code,
             rating, total_products, total_orders,
             response_rate, response_time,
             is_verified, is_active,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, item.getUser_id());
            ps.setString(2, item.getShop_name());
            ps.setString(3, item.getShop_description());
            ps.setString(4, item.getShop_logo());
            ps.setString(5, item.getShop_banner());
            ps.setString(6, item.getBusiness_license());
            ps.setString(7, item.getTax_code());

            ps.setDouble(8, item.getRating());
            ps.setInt(9, item.getTotal_products());
            ps.setInt(10, item.getTotal_orders());

            ps.setDouble(11, item.getResponse_rate());
            ps.setInt(12, item.getResponse_time());

            ps.setInt(13, item.getIs_verified());
            ps.setInt(14, item.getIs_active());
            ps.setTimestamp(15, java.sql.Timestamp.valueOf(item.getCreated_at()));
            ps.setTimestamp(16, java.sql.Timestamp.valueOf(item.getUpdated_at()));

            int rows = ps.executeUpdate();

            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        item.setId(rs.getLong(1));
                    }
                }
                return item;
            }
        }

        return null;
    }

    /* ================= UPDATE ================= */
    @Override
    public Shop Update(Shop item) {

        String sql = """
            UPDATE shop SET
                shop_name = ?,
                shop_description = ?,
                shop_logo = ?,
                shop_banner = ?,
                business_license = ?,
                tax_code = ?,
                is_verified = ?,
                is_active = ?,
                updated_at = ?
            WHERE shop_id = ?
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, item.getShop_name());
            ps.setString(2, item.getShop_description());
            ps.setString(3, item.getShop_logo());
            ps.setString(4, item.getShop_banner());
            ps.setString(5, item.getBusiness_license());
            ps.setString(6, item.getTax_code());
            ps.setInt(7, item.getIs_verified());
            ps.setInt(8, item.getIs_active());
            ps.setTimestamp(9, java.sql.Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(10, item.getId());

            return ps.executeUpdate() > 0 ? item : null;

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

    /* ================= DELETE ================= */

    public boolean Delete(Shop item) {

        String sql = "DELETE FROM shop WHERE shop_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, item.getId());
            return ps.executeUpdate() > 0;

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    /* ================= GET BY ID ================= */
    @Override
    public Shop GetById(Object id) {

        String sql = "SELECT * FROM shop WHERE shop_id = ?";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, Long.parseLong(id.toString()));
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return shopMapper.RowMap(rs);
            }

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }
    
    public Shop GetByUserId(int user_id) {
    	System.out.print("Get by user id");
    	String sql = "select * from shop where user_id = ?";
    	try (Connection con = dbConnection.getConn();
                PreparedStatement ps = con.prepareStatement(sql)){
    	    ps.setLong(1, user_id);
    	    
    	    ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return shopMapper.RowMap(rs);
            }

    	}
    	catch (Exception ex) {
    		
    	}
    	
    	return null;
    }

    /* ================= GET ALL ================= */
    @Override
    public List<Shop> GetAll() {

        String sql = "SELECT * FROM shop";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return shopMapper.RowsMap(rs);

        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return new ArrayList<>();
    }

	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}
}
