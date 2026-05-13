package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherUsageHistoryLegacyMapper;
import docker_test.com.models.voucher.VoucherUsageHistoryLegacy;

public class VoucherUsageHistoryLegacyRepository implements IRepositories<VoucherUsageHistoryLegacy> {

	private static VoucherUsageHistoryLegacyRepository instance;
	private final DBConnection dbConnection;
	private final VoucherUsageHistoryLegacyMapper mapper;

	public VoucherUsageHistoryLegacyRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherUsageHistoryLegacyMapper();
	}

	public static synchronized VoucherUsageHistoryLegacyRepository Instance() {
		if (instance == null) {
			instance = new VoucherUsageHistoryLegacyRepository();
		}
		return instance;
	}

	@Override
	public VoucherUsageHistoryLegacy Create(VoucherUsageHistoryLegacy v) throws SQLException {

		String sql = """
					INSERT INTO voucher_usage_history_legacy (
						voucher_id, user_id, order_id, order_shipment_id, discount_amount, used_at
					)
					VALUES (?, ?, ?, ?, ?, NOW())
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, v.getVoucherId());
			ps.setObject(2, v.getUserId());
			ps.setObject(3, v.getOrderId());
			ps.setObject(4, v.getOrderShipmentId());
			ps.setObject(5, v.getDiscountAmount());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				v.setId(rs.getLong(1));
			}

			return v;
		}
	}

	@Override
	public VoucherUsageHistoryLegacy Update(VoucherUsageHistoryLegacy v) {
		throw new RuntimeException("Not supported");
	}

	@Override
	public boolean Delete(int id) {
		throw new RuntimeException("Not allowed");
	}

	@Override
	public VoucherUsageHistoryLegacy GetById(int id) {

		String sql = "SELECT * FROM voucher_usage_history_legacy WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			return rs.next() ? mapper.RowMap(rs) : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public List<VoucherUsageHistoryLegacy> GetAll() {

		String sql = "SELECT * FROM voucher_usage_history_legacy ORDER BY used_at DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public List<VoucherUsageHistoryLegacy> getByUserId(Long userId) {

		String sql = "SELECT * FROM voucher_usage_history_legacy WHERE user_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, userId);
			return mapper.RowsMap(ps.executeQuery());

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}
