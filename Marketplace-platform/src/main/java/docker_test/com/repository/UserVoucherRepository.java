package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.UserVoucherMapper;
import docker_test.com.models.voucher.UserVoucher;

public class UserVoucherRepository implements IRepositories<UserVoucher> {

	private static UserVoucherRepository instance;
	private final DBConnection dbConnection;
	private final UserVoucherMapper mapper;

	public UserVoucherRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new UserVoucherMapper();
	}

	public static synchronized UserVoucherRepository Instance() {
		if (instance == null) {
			instance = new UserVoucherRepository();
		}
		return instance;
	}

	@Override
	public UserVoucher Create(UserVoucher u) throws SQLException {

		String updateVoucherSql = """
					UPDATE voucher
					SET claimed_count = COALESCE(claimed_count, 0) + 1,
					    updated_at = NOW()
					WHERE id = ?
					  AND (total_quota IS NULL OR COALESCE(claimed_count, 0) < total_quota)
				""";
		String insertSql = """
					INSERT INTO user_voucher (
						user_id, voucher_id, claim_channel,
						claimed_at, status
					)
					VALUES (?, ?, ?, NOW(), ?)
				""";

		Connection con = null;
		try {
			con = dbConnection.getConn();
			try (PreparedStatement updateVoucherPs = con.prepareStatement(updateVoucherSql);
				PreparedStatement insertPs = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {

				con.setAutoCommit(false);

				updateVoucherPs.setObject(1, u.getVoucherId());
				int updatedRows = updateVoucherPs.executeUpdate();
				if (updatedRows <= 0) {
					throw new SQLException("Voucher has reached total_quota or does not exist");
				}
				System.out.println("✅ Increased claimed_count for voucher_id=" + u.getVoucherId()
					+ " | updatedRows=" + updatedRows);

				insertPs.setObject(1, u.getUserId());
				insertPs.setObject(2, u.getVoucherId());
				insertPs.setString(3, u.getClaimChannel());
				insertPs.setString(4, u.getStatus());

				insertPs.executeUpdate();

				ResultSet rs = insertPs.getGeneratedKeys();
				if (rs.next()) {
					u.setId(rs.getLong(1));
				}

				con.commit();
				System.out.println("✅ Claim transaction committed for user_id=" + u.getUserId()
					+ " voucher_id=" + u.getVoucherId());
				return u;
			}
		} catch (Exception e) {
			if (con != null) {
				try {
					con.rollback();
				} catch (SQLException rollbackEx) {
					e.addSuppressed(rollbackEx);
				}
			}
			throw new SQLException("Create user_voucher failed: " + e.getMessage(), e);
		} finally {
			if (con != null) {
				try {
					con.setAutoCommit(true);
					con.close();
				} catch (SQLException ignored) {
				}
			}
		}
	}

	@Override
	public UserVoucher Update(UserVoucher u) {

		String currentSql = """
					SELECT voucher_id, status
					FROM user_voucher
					WHERE id = ?
					FOR UPDATE
				""";
		String updateUserVoucherSql = """
					UPDATE user_voucher SET
						status = ?,
						reserved_order_id = ?,
						reserved_at = ?,
						expired_at = ?,
						redeemed_at = ?
					WHERE id = ?
				""";
		String incrementRedeemedSql = """
					UPDATE voucher
					SET redeemed_count = COALESCE(redeemed_count, 0) + 1,
						updated_at = NOW()
					WHERE id = ?
				""";

		Connection con = null;
		try {
			con = dbConnection.getConn();
			con.setAutoCommit(false);

			Long voucherId = null;
			String currentStatus = null;

			try (PreparedStatement currentPs = con.prepareStatement(currentSql)) {
				currentPs.setObject(1, u.getId());
				try (ResultSet rs = currentPs.executeQuery()) {
					if (!rs.next()) {
						con.rollback();
						return null;
					}
					voucherId = rs.getLong("voucher_id");
					currentStatus = rs.getString("status");
					u.setVoucherId(voucherId);
				}
			}

			try (PreparedStatement ps = con.prepareStatement(updateUserVoucherSql)) {
				ps.setString(1, u.getStatus());
				ps.setObject(2, u.getReservedOrderId());
				ps.setObject(3, u.getReservedAt());
				ps.setObject(4, u.getExpiredAt());
				ps.setObject(5, u.getRedeemedAt());
				ps.setObject(6, u.getId());

				if (ps.executeUpdate() <= 0) {
					con.rollback();
					return null;
				}
			}

			boolean redeemingNow = "REDEEMED".equalsIgnoreCase(u.getStatus())
					&& !"REDEEMED".equalsIgnoreCase(currentStatus);
			if (redeemingNow) {
				try (PreparedStatement redeemPs = con.prepareStatement(incrementRedeemedSql)) {
					redeemPs.setObject(1, voucherId);
					if (redeemPs.executeUpdate() <= 0) {
						throw new SQLException("Voucher not found: " + voucherId);
					}
				}
			}

			con.commit();
			return u;

		} catch (Exception e) {
			if (con != null) {
				try {
					con.rollback();
				} catch (SQLException rollbackEx) {
					e.addSuppressed(rollbackEx);
				}
			}
			throw new RuntimeException(e);
		} finally {
			if (con != null) {
				try {
					con.setAutoCommit(true);
					con.close();
				} catch (SQLException ignored) {
				}
			}
		}
	}

	@Override
	public boolean Delete(int id) {
		throw new RuntimeException("Not allowed delete user_voucher");
	}

	@Override
	public UserVoucher GetById(int id) {

		String sql = "SELECT * FROM user_voucher WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			return rs.next() ? mapper.RowMap(rs) : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public List<UserVoucher> GetAll() {

		String sql = "SELECT * FROM user_voucher ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public List<UserVoucher> getByUserId(Long userId) {

		String sql = "SELECT * FROM user_voucher WHERE user_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, userId);
			return mapper.RowsMap(ps.executeQuery());

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}
