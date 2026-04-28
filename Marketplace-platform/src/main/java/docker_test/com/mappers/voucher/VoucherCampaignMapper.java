package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherCampaign;

public final class VoucherCampaignMapper implements IMapper<VoucherCampaign> {

	@Override
	public VoucherCampaign RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherCampaign mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherCampaign v = new VoucherCampaign();

		// ===== ID =====
		v.setId(getInteger(rs, "id"));

		// ===== BASIC =====
		v.setCode(rs.getString("code"));
		v.setName(rs.getString("name"));
		v.setDescription(rs.getString("description"));

		// ===== TIME =====
		v.setStart_at(getDateTime(rs, "start_at"));
		v.setEnd_at(getDateTime(rs, "end_at"));

		// ===== STATUS =====
		v.setStatus(toUpper(rs.getString("status")));

		// ===== AUDIT =====
		v.setCreated_by(getInteger(rs, "created_by"));
		v.setCreated_at(getDateTime(rs, "created_at"));
		v.setUpdated_at(getDateTime(rs, "updated_at"));

		return v;
	}

	@Override
	public List<VoucherCampaign> RowsMap(ResultSet rs) {
		List<VoucherCampaign> list = new ArrayList<>();
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

	private Integer getInteger(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).intValue() : null;
	}

	private java.time.LocalDateTime getDateTime(ResultSet rs, String col) throws SQLException {
		Timestamp ts = rs.getTimestamp(col);
		return ts != null ? ts.toLocalDateTime() : null;
	}

	private String toUpper(String val) {
		return val != null ? val.toUpperCase() : null;
	}
}