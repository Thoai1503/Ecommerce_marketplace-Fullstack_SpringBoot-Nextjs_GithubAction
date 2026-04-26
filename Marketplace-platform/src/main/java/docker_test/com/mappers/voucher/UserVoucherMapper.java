package docker_test.com.mappers.voucher;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.UserVoucher;

public final class UserVoucherMapper implements IMapper<UserVoucher> {

	@Override
	public UserVoucher RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public UserVoucher mapRow(ResultSet rs, int rowNum) throws SQLException {

		UserVoucher u = new UserVoucher();

		u.setId(rs.getLong("id"));
		u.setUserId(getLong(rs, "user_id"));
		u.setVoucherId(getLong(rs, "voucher_id"));

		u.setClaimChannel(rs.getString("claim_channel"));
		u.setClaimedAt(getDateTime(rs, "claimed_at"));

		u.setStatus(toUpper(rs.getString("status")));

		u.setReservedOrderId(getLong(rs, "reserved_order_id"));
		u.setReservedAt(getDateTime(rs, "reserved_at"));

		u.setExpiredAt(getDateTime(rs, "expired_at"));
		u.setRedeemedAt(getDateTime(rs, "redeemed_at"));

		return u;
	}

	@Override
	public List<UserVoucher> RowsMap(ResultSet rs) {
		List<UserVoucher> list = new ArrayList<>();
		try {
			int i = 0;
			while (rs.next()) {
				list.add(mapRow(rs, i++));
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return list;
	}

	private Long getLong(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).longValue() : null;
	}

	private java.time.LocalDateTime getDateTime(ResultSet rs, String col) throws SQLException {
		Timestamp ts = rs.getTimestamp(col);
		return ts != null ? ts.toLocalDateTime() : null;
	}

	private String toUpper(String val) {
		return val != null ? val.toUpperCase() : null;
	}
}