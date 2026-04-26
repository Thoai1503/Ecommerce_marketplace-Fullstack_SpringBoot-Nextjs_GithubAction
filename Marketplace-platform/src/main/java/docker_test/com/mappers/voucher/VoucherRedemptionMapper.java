package docker_test.com.mappers.voucher;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherRedemption;

public final class VoucherRedemptionMapper implements IMapper<VoucherRedemption> {

	@Override
	public VoucherRedemption RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherRedemption mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherRedemption v = new VoucherRedemption();

		v.setId(rs.getLong("id"));
		v.setUserVoucherId(getLong(rs, "user_voucher_id"));
		v.setVoucherId(getLong(rs, "voucher_id"));
		v.setUserId(getLong(rs, "user_id"));

		v.setOrderId(getLong(rs, "order_id"));
		v.setOrderCode(rs.getString("order_code"));

		v.setOriginalShippingFee(rs.getBigDecimal("original_shipping_fee"));
		v.setOriginalOrderAmount(rs.getBigDecimal("original_order_amount"));
		v.setDiscountAmountApplied(rs.getBigDecimal("discount_amount_applied"));
		v.setFinalOrderAmount(rs.getBigDecimal("final_order_amount"));

		v.setRedeemedAt(getDateTime(rs, "redeemed_at"));
		v.setStatus(toUpper(rs.getString("status")));
		v.setFailureReason(rs.getString("failure_reason"));

		return v;
	}

	@Override
	public List<VoucherRedemption> RowsMap(ResultSet rs) {
		List<VoucherRedemption> list = new ArrayList<>();
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