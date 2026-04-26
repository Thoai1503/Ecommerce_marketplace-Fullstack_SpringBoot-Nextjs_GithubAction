package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherScopeRule;

public final class VoucherScopeRuleMapper implements IMapper<VoucherScopeRule> {

	@Override
	public VoucherScopeRule RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherScopeRule mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherScopeRule v = new VoucherScopeRule();

		// ===== ID =====
		v.setId(rs.getLong("id"));

		// ===== RELATION =====
		v.setVoucherId(getLong(rs, "voucher_id"));

		// ===== RULE =====
		v.setScopeType(toUpper(rs.getString("scope_type")));
		v.setScopeId(getLong(rs, "scope_id"));
		v.setIncludeExclude(toUpper(rs.getString("include_exclude")));

		// ===== TIME =====
		v.setCreatedAt(getDateTime(rs, "created_at"));

		return v;
	}

	@Override
	public List<VoucherScopeRule> RowsMap(ResultSet rs) {
		List<VoucherScopeRule> list = new ArrayList<>();
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

	// ================= HELPER METHODS =================

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