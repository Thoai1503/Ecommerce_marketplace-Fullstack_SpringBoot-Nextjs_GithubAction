package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherRedemptionMapper;
import docker_test.com.models.voucher.VoucherRedemption;

public class VoucherRedemptionRepository implements IRepositories<VoucherRedemption> {

	private static VoucherRedemptionRepository instance;
	private final DBConnection dbConnection;
	private final VoucherRedemptionMapper mapper;

	public VoucherRedemptionRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherRedemptionMapper();
	}

	public static synchronized VoucherRedemptionRepository Instance() {
		if (instance == null) {
			instance = new VoucherRedemptionRepository();
		}
		return instance;
	}

	@Override
	public VoucherRedemption Create(VoucherRedemption v) throws SQLException {

		String sql = """
					INSERT INTO voucher_redemption (
						user_voucher_id, voucher_id, user_id,
						order_id, order_code,
						original_shipping_fee, original_order_amount,
						discount_amount_applied, final_order_amount,
						redeemed_at, status, failure_reason
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, v.getUserVoucherId());
			ps.setObject(2, v.getVoucherId());
			ps.setObject(3, v.getUserId());
			ps.setObject(4, v.getOrderId());
			ps.setString(5, v.getOrderCode());

			ps.setObject(6, v.getOriginalShippingFee());
			ps.setObject(7, v.getOriginalOrderAmount());
			ps.setObject(8, v.getDiscountAmountApplied());
			ps.setObject(9, v.getFinalOrderAmount());

			ps.setString(10, v.getStatus());
			ps.setString(11, v.getFailureReason());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				v.setId(rs.getLong(1));
			}

			return v;
		}
	}

	@Override
	public VoucherRedemption Update(VoucherRedemption v) {

		String sql = """
					UPDATE voucher_redemption SET
						status = ?,
						failure_reason = ?
					WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, v.getStatus());
			ps.setString(2, v.getFailureReason());
			ps.setObject(3, v.getId());

			return ps.executeUpdate() > 0 ? v : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public boolean Delete(int id) {
		throw new RuntimeException("Not allowed delete redemption");
	}

	@Override
	public VoucherRedemption GetById(int id) {

		String sql = "SELECT * FROM voucher_redemption WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			return rs.next() ? mapper.RowMap(rs) : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public List<VoucherRedemption> GetAll() {

		String sql = "SELECT * FROM voucher_redemption ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public List<VoucherRedemption> getByUserId(Long userId) {

		String sql = "SELECT * FROM voucher_redemption WHERE user_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, userId);
			return mapper.RowsMap(ps.executeQuery());

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}