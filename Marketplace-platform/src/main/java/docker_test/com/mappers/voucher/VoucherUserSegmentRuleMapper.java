package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherUserSegmentRule;

public final class VoucherUserSegmentRuleMapper implements IMapper<VoucherUserSegmentRule> {

	@Override
	public VoucherUserSegmentRule RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherUserSegmentRule mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherUserSegmentRule v = new VoucherUserSegmentRule();

		v.setId(rs.getLong("id"));
		v.setVoucherId(getLong(rs, "voucher_id"));
		v.setSegmentType(toUpper(rs.getString("segment_type")));
		v.setSegmentValue(rs.getString("segment_value"));

		return v;
	}

	@Override
	public List<VoucherUserSegmentRule> RowsMap(ResultSet rs) {
		List<VoucherUserSegmentRule> list = new ArrayList<>();
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

	// ===== helper =====
	private Long getLong(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).longValue() : null;
	}

	private String toUpper(String val) {
		return val != null ? val.toUpperCase() : null;
	}
}