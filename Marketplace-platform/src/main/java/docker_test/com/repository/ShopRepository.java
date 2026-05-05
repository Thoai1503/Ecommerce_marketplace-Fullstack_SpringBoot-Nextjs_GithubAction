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
				     owner_name, url_card_front, url_card_back,
				     business_license, tax_code,
				     rating, total_products, total_orders,
				     response_rate, response_time,
				     is_verified, is_active,
				     created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setLong(1, item.getUser_id());
			ps.setString(2, item.getShop_name());
			ps.setString(3, item.getShop_description());
			ps.setString(4, item.getShop_logo());
			ps.setString(5, item.getShop_banner());
			ps.setString(6, item.getOwner_name());
			ps.setString(7, item.getUrl_card_front());
			ps.setString(8, item.getUrl_card_back());
			ps.setString(9, item.getBusiness_license());
			ps.setString(10, item.getTax_code());

			ps.setDouble(11, item.getRating());
			ps.setInt(12, item.getTotal_products());
			ps.setInt(13, item.getTotal_orders());

			ps.setDouble(14, item.getResponse_rate());
			ps.setInt(15, item.getResponse_time());

			ps.setInt(16, item.getIs_verified());
			ps.setInt(17, item.getIs_active());
			ps.setTimestamp(18, java.sql.Timestamp.valueOf(item.getCreated_at()));
			ps.setTimestamp(19, java.sql.Timestamp.valueOf(item.getUpdated_at()));

			int rows = ps.executeUpdate();

			if (rows > 0) {
				try (ResultSet rs = ps.getGeneratedKeys()) {
					if (rs.next()) {
						item.setId(rs.getLong(1));
					}
				}
				return item;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
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
				        owner_name = ?,
				        url_card_front = ?,
				        url_card_back = ?,
				        business_license = ?,
				        tax_code = ?,
				        is_verified = ?,
				        is_active = ?,
				        updated_at = ?
				    WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, item.getShop_name());
			ps.setString(2, item.getShop_description());
			ps.setString(3, item.getShop_logo());
			ps.setString(4, item.getShop_banner());
			ps.setString(5, item.getOwner_name());
			ps.setString(6, item.getUrl_card_front());
			ps.setString(7, item.getUrl_card_back());
			ps.setString(8, item.getBusiness_license());
			ps.setString(9, item.getTax_code());
			ps.setInt(10, item.getIs_verified());
			ps.setInt(11, item.getIs_active());
			ps.setTimestamp(12, java.sql.Timestamp.valueOf(LocalDateTime.now()));
			ps.setLong(13, item.getId());

			return ps.executeUpdate() > 0 ? item : null;
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	/* ================= DELETE ================= */

	public boolean Delete(Shop item) {

		String sql = "DELETE FROM shop WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setLong(1, item.getId());
			return ps.executeUpdate() > 0;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return false;
	}

	/* ================= GET BY ID ================= */
	public Shop GetById(int id) {
		String sql = "SELECT * FROM shop WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return new ShopMapper().RowMap(rs); // ✅ map đúng
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

	public Shop GetByUserId(long user_id) {
		System.out.print("Get by user id");
		String sql = "select * from shop where user_id = ?";
		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, user_id);

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

	public boolean VerifyShop(long id) {

		String sql = """
				    UPDATE shop
				    SET is_verified = 1,
				        updated_at = ?
				    WHERE id = ? AND is_verified = 0
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setTimestamp(1, java.sql.Timestamp.valueOf(LocalDateTime.now()));
			ps.setLong(2, id);

			return ps.executeUpdate() > 0;

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return false;
	}

	public boolean VerifyShopAndUpdateUser(long shopId) {
		String getUserSql = "SELECT user_id FROM shop WHERE id = ?";
		String updateShopSql = """
				    UPDATE shop
				    SET is_verified = 1,
				        updated_at = ?
				    WHERE id = ? AND is_verified = 0
				""";
		String updateUserSql = """
				    UPDATE user
				    SET user_type = 'both'
				    WHERE id = ?
				""";

		Connection con = null;

		try {
			con = dbConnection.getConn();
			con.setAutoCommit(false);

			long userId;

			try (PreparedStatement ps = con.prepareStatement(getUserSql)) {
				ps.setLong(1, shopId);

				try (ResultSet rs = ps.executeQuery()) {
					if (!rs.next()) {
						con.rollback();
						return false;
					}

					userId = rs.getLong("user_id");
				}
			}

			int shopUpdated;

			try (PreparedStatement ps = con.prepareStatement(updateShopSql)) {
				ps.setTimestamp(1, java.sql.Timestamp.valueOf(LocalDateTime.now()));
				ps.setLong(2, shopId);

				shopUpdated = ps.executeUpdate();
			}

			if (shopUpdated <= 0) {
				con.rollback();
				return false;
			}

			try (PreparedStatement ps = con.prepareStatement(updateUserSql)) {
				ps.setLong(1, userId);
				ps.executeUpdate();
			}

			con.commit();
			return true;

		} catch (Exception ex) {
			ex.printStackTrace();

			try {
				if (con != null)
					con.rollback();
			} catch (Exception rollbackEx) {
				rollbackEx.printStackTrace();
			}

			return false;
		} finally {
			try {
				if (con != null) {
					con.setAutoCommit(true);
					con.close();
				}
			} catch (Exception closeEx) {
				closeEx.printStackTrace();
			}
		}
	}

}
