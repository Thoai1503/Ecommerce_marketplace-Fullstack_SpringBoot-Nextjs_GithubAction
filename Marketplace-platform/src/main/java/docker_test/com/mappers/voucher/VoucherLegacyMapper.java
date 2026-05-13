package docker_test.com.mappers.voucher;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherLegacy;

public final class VoucherLegacyMapper implements IMapper<VoucherLegacy> {

	@Override
	public VoucherLegacy RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherLegacy mapRow(ResultSet rs, int rowNum) throws SQLException {
		VoucherLegacy v = new VoucherLegacy();

		v.setId(getLong(rs, "id"));
		v.setShopId(getLong(rs, "shop_id"));
		v.setVoucherCode(rs.getString("voucher_code"));
		v.setVoucherName(rs.getString("voucher_name"));
		v.setDescription(rs.getString("description"));
		v.setDiscountType(toUpper(rs.getString("discount_type")));
		v.setDiscountValue(rs.getBigDecimal("discount_value"));
		v.setMinOrderValue(rs.getBigDecimal("min_order_value"));
		v.setMaxDiscount(rs.getBigDecimal("max_discount"));
		v.setUsageLimit(getInteger(rs, "usage_limit"));
		v.setUsedCount(getIntegerOrDefault(rs, "used_count", 0));
		v.setStartDate(getDateTime(rs, "start_date"));
		v.setEndDate(getDateTime(rs, "end_date"));
		v.setIsActive(rs.getInt("is_active") == 1);
		v.setCreatedAt(getDateTime(rs, "created_at"));

		return v;
	}

	@Override
	public List<VoucherLegacy> RowsMap(ResultSet rs) {
		List<VoucherLegacy> list = new ArrayList<>();
		try {
			int rowNum = 0;
			while (rs.next()) {
				list.add(mapRow(rs, rowNum++));
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

	private Integer getInteger(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).intValue() : null;
	}

	private Integer getIntegerOrDefault(ResultSet rs, String col, int defaultVal) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).intValue() : defaultVal;
	}

	private java.time.LocalDateTime getDateTime(ResultSet rs, String col) throws SQLException {
		Timestamp ts = rs.getTimestamp(col);
		return ts != null ? ts.toLocalDateTime() : null;
	}

	private String toUpper(String val) {
		return val != null ? val.toUpperCase() : null;
	}
}