package docker_test.com.repository;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.voucher.VoucherRedemptionItem;

public class VoucherRedemptionItemRepository implements IRepositories<VoucherRedemptionItem> {

	private static VoucherRedemptionItemRepository instance;
	private final DBConnection dbConnection;

	public VoucherRedemptionItemRepository() {
		this.dbConnection = DBConnection.getInstance();
	}

	public static synchronized VoucherRedemptionItemRepository Instance() {
		if (instance == null) {
			instance = new VoucherRedemptionItemRepository();
		}
		return instance;
	}

	@Override
	public VoucherRedemptionItem Create(VoucherRedemptionItem item) throws SQLException {
		String sql = """
					INSERT INTO voucher_redemption_item (
						voucher_redemption_id, order_item_id, discount_amount
					)
					VALUES (?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, item.getVoucherRedemptionId());
			ps.setObject(2, item.getOrderItemId());
			ps.setObject(3, normalizeDiscount(item.getDiscountAmount()));

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				item.setId(rs.getLong(1));
			}

			return item;
		}
	}

	public List<VoucherRedemptionItem> getByRedemptionId(Long voucherRedemptionId) {
		String sql = """
					SELECT *
					FROM voucher_redemption_item
					WHERE voucher_redemption_id = ?
					ORDER BY id ASC
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setObject(1, voucherRedemptionId);
			return mapRows(ps.executeQuery());
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public List<VoucherRedemptionItem> getByOrderId(Long orderId) {
		String sql = """
					SELECT vri.*
					FROM voucher_redemption_item vri
					JOIN voucher_redemption vr ON vr.id = vri.voucher_redemption_id
					WHERE vr.order_id = ?
					ORDER BY vri.id ASC
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setObject(1, orderId);
			return mapRows(ps.executeQuery());
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public VoucherRedemptionItem Update(VoucherRedemptionItem item) {
		String sql = """
					UPDATE voucher_redemption_item
					SET discount_amount = ?
					WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setObject(1, normalizeDiscount(item.getDiscountAmount()));
			ps.setObject(2, item.getId());
			return ps.executeUpdate() > 0 ? item : null;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public boolean Delete(int id) {
		String sql = "DELETE FROM voucher_redemption_item WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, id);
			return ps.executeUpdate() > 0;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public VoucherRedemptionItem GetById(int id) {
		String sql = "SELECT * FROM voucher_redemption_item WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();
			return rs.next() ? mapRow(rs) : null;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public List<VoucherRedemptionItem> GetAll() {
		String sql = "SELECT * FROM voucher_redemption_item ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			return mapRows(rs);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private List<VoucherRedemptionItem> mapRows(ResultSet rs) throws SQLException {
		List<VoucherRedemptionItem> rows = new ArrayList<>();
		while (rs.next()) {
			rows.add(mapRow(rs));
		}
		return rows;
	}

	private VoucherRedemptionItem mapRow(ResultSet rs) throws SQLException {
		VoucherRedemptionItem item = new VoucherRedemptionItem();
		item.setId(rs.getLong("id"));
		item.setVoucherRedemptionId(rs.getLong("voucher_redemption_id"));
		item.setOrderItemId(rs.getLong("order_item_id"));
		item.setDiscountAmount(rs.getBigDecimal("discount_amount"));
		return item;
	}

	private BigDecimal normalizeDiscount(BigDecimal discountAmount) {
		if (discountAmount == null || discountAmount.signum() < 0) {
			return BigDecimal.ZERO;
		}
		return discountAmount;
	}
}
