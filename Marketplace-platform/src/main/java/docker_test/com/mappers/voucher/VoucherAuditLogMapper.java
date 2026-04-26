package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherAuditLog;

public final class VoucherAuditLogMapper implements IMapper<VoucherAuditLog> {

	@Override
	public VoucherAuditLog RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherAuditLog mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherAuditLog log = new VoucherAuditLog();

		log.setId(rs.getLong("id"));
		log.setVoucherId(getLong(rs, "voucher_id"));
		log.setEventType(toUpper(rs.getString("event_type")));
		log.setActorType(toUpper(rs.getString("actor_type")));
		log.setActorId(getLong(rs, "actor_id"));
		log.setEntityType(toUpper(rs.getString("entity_type")));
		log.setEntityId(getLong(rs, "entity_id"));
		log.setOldData(rs.getString("old_data"));
		log.setNewData(rs.getString("new_data"));
		log.setNote(rs.getString("note"));
		log.setCreatedAt(getDateTime(rs, "created_at"));

		return log;
	}

	@Override
	public List<VoucherAuditLog> RowsMap(ResultSet rs) {
		List<VoucherAuditLog> list = new ArrayList<>();
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

	private java.time.LocalDateTime getDateTime(ResultSet rs, String col) throws SQLException {
		Timestamp ts = rs.getTimestamp(col);
		return ts != null ? ts.toLocalDateTime() : null;
	}

	private String toUpper(String val) {
		return val != null ? val.toUpperCase() : null;
	}
}