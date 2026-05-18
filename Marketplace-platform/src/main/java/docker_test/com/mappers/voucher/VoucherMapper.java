package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.Voucher;

public final class VoucherMapper implements IMapper<Voucher> {

	@Override
	public Voucher RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public Voucher mapRow(ResultSet rs, int rowNum) throws SQLException {

		Voucher v = new Voucher();

		// ===== ID =====
		v.setId(rs.getLong("id"));
	//	v.setCampaignId(getLong(rs, "campaign_id"));

		// ===== BASIC =====
		v.setCode(rs.getString("code"));
		//v.setTitle(rs.getString("title"));
	//	v.setDescription(rs.getString("description"));

		// ===== ISSUER =====
		v.setIssuerType(toUpper(rs.getString("issuer_type")));
		v.setIssuerId(getLong(rs, "issuer_id"));

		// ===== DISCOUNT =====
		v.setDiscountType(toUpper(rs.getString("discount_type")));
		v.setDiscountPercent(rs.getBigDecimal("discount_percent"));
		v.setDiscountAmount(rs.getBigDecimal("discount_amount"));
		v.setMaxDiscountAmount(rs.getBigDecimal("max_discount_amount"));

		// ===== ORDER CONDITION =====
		v.setMinOrderValue(rs.getBigDecimal("min_order_value"));
		v.setMaxOrderValue(rs.getBigDecimal("max_order_value"));

		// ===== QUOTA =====
		v.setTotalQuota(getInteger(rs, "total_quota"));
		v.setClaimedCount(getIntegerOrDefault(rs, "claimed_count", 0));
		v.setRedeemedCount(getIntegerOrDefault(rs, "redeemed_count", 0));
		v.setPerUserQuota(getInteger(rs, "per_user_quota"));

		// ===== FLAG =====
		v.setStackable(rs.getInt("stackable") == 1);

		// ===== TIME =====
		v.setClaimStartAt(getDateTime(rs, "claim_start_at"));
		v.setClaimEndAt(getDateTime(rs, "claim_end_at"));
		v.setValidFrom(getDateTime(rs, "valid_from"));
		v.setValidTo(getDateTime(rs, "valid_to"));

		// ===== STATUS =====
		v.setStatus(toUpper(rs.getString("status")));
		v.setPriority(getIntegerOrDefault(rs, "priority", 0));

		// ===== AUDIT =====
		v.setCreatedBy(getLong(rs, "created_by"));
		v.setCreatedAt(getDateTime(rs, "created_at"));
		v.setUpdatedAt(getDateTime(rs, "updated_at"));

		return v;
	}

	@Override
	public List<Voucher> RowsMap(ResultSet rs) {
		List<Voucher> list = new ArrayList<>();
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