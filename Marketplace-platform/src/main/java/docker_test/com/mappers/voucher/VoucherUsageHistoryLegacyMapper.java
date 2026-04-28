package docker_test.com.mappers.voucher;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherUsageHistoryLegacy;

public final class VoucherUsageHistoryLegacyMapper implements IMapper<VoucherUsageHistoryLegacy> {

	@Override
	public VoucherUsageHistoryLegacy RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherUsageHistoryLegacy mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherUsageHistoryLegacy v = new VoucherUsageHistoryLegacy();

		v.setId(rs.getLong("id"));
		v.setVoucherId(getLong(rs, "voucher_id"));
		v.setUserId(getLong(rs, "user_id"));
		v.setOrderId(getLong(rs, "order_id"));
		v.setDiscountAmount(rs.getBigDecimal("discount_amount"));
		v.setUsedAt(getDateTime(rs, "used_at"));

		return v;
	}

	@Override
	public List<VoucherUsageHistoryLegacy> RowsMap(ResultSet rs) {
		List<VoucherUsageHistoryLegacy> list = new ArrayList<>();
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
}