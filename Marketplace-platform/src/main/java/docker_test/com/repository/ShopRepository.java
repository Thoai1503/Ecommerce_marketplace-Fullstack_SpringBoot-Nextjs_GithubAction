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

            ps.setLong(1, item.getUserId());
            ps.setString(2, item.getShopName());
            ps.setString(3, item.getShopDescription());
            ps.setString(4, item.getShopLogo());
            ps.setString(5, item.getShopBanner());
            ps.setString(6, item.getBusinessLicense());
            ps.setString(7, item.getTaxCode());

            ps.setDouble(8, item.getRating());
            ps.setInt(9, item.getTotalProducts());
            ps.setInt(10, item.getTotalOrders());

            ps.setDouble(11, item.getResponseRate());
            ps.setInt(12, item.getResponseTime());

            ps.setInt(13, item.isVerified());
            ps.setInt(14, item.isActive());
            ps.setTimestamp(15, java.sql.Timestamp.valueOf(item.getCreatedAt()));
            ps.setTimestamp(16, java.sql.Timestamp.valueOf(item.getUpdatedAt()));

            int rows = ps.executeUpdate();

            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        item.setShopId(rs.getLong(1));
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

            ps.setString(1, item.getShopName());
            ps.setString(2, item.getShopDescription());
            ps.setString(3, item.getShopLogo());
            ps.setString(4, item.getShopBanner());
            ps.setString(5, item.getBusinessLicense());
            ps.setString(6, item.getTaxCode());
            ps.setInt(7, item.isVerified());
            ps.setInt(8, item.isActive());
            ps.setTimestamp(9, java.sql.Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(10, item.getShopId());

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

            ps.setLong(1, item.getShopId());
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
