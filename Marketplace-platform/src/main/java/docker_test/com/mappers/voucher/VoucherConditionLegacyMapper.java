package docker_test.com.mappers.voucher;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherConditionLegacy;

public final class VoucherConditionLegacyMapper implements IMapper<VoucherConditionLegacy> {

	@Override
	public VoucherConditionLegacy RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherConditionLegacy mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherConditionLegacy c = new VoucherConditionLegacy();

		c.setId(rs.getLong("id"));
		c.setVoucherId(getLong(rs, "voucher_id"));
		c.setConditionTypeId(getInteger(rs, "condition_type_id"));
		c.setOperator(rs.getString("operator"));

		c.setValueNumeric(rs.getBigDecimal("value_numeric"));
		c.setValueNumericMax(rs.getBigDecimal("value_numeric_max"));
		c.setValueText(rs.getString("value_text"));
		c.setValueJson(rs.getString("value_json"));

		c.setIsRequired(rs.getInt("is_required") == 1);
		c.setPriority(getInteger(rs, "priority"));
		c.setErrorMessage(rs.getString("error_message"));

		c.setCreatedAt(getDateTime(rs, "created_at"));
		c.setUpdatedAt(getDateTime(rs, "updated_at"));

		return c;
	}

	@Override
	public List<VoucherConditionLegacy> RowsMap(ResultSet rs) {
		List<VoucherConditionLegacy> list = new ArrayList<>();
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

	// ===== helper =====
	private Long getLong(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).longValue() : null;
	}

	private Integer getInteger(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).intValue() : null;
	}

	private java.time.LocalDateTime getDateTime(ResultSet rs, String col) throws SQLException {
		Timestamp ts = rs.getTimestamp(col);
		return ts != null ? ts.toLocalDateTime() : null;
	}
}