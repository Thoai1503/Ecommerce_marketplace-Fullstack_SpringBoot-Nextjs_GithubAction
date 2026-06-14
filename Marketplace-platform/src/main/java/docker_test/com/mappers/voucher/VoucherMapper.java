package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.Brand;
import docker_test.com.models.Category;
import docker_test.com.models.voucher.Voucher;
import docker_test.com.models.voucher.VoucherScopeRule;

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
		v.setCampaignId(getLong(rs, "campaign_id"));

		// ===== BASIC =====
		v.setCode(rs.getString("code"));
	v.setTitle(rs.getString("title"));
	v.setDescription(rs.getString("description"));

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
	//	VoucherScopeRule scopeRule = mapScopeRule(rs, v.getId());
//		if (scopeRule != null) {
//			v.addScopeRule(scopeRule);
//		}
		return v;
	}

	public VoucherScopeRule mapScopeRule(ResultSet rs, Long voucherId) throws SQLException {
		String scopeType = toUpper(rs.getString("scope_type"));
		if (scopeType == null) {
			return null;
		}

		VoucherScopeRule scopeRule = new VoucherScopeRule();
		scopeRule.setScopeType(scopeType);
		scopeRule.setIncludeExclude(toUpper(rs.getString("include_exclude")));
		scopeRule.setScopeId(getLong(rs, "scope_id"));
		scopeRule.setVoucherId(voucherId);

		if (scopeRule.getScopeId() != null) {
			if ("CATEGORY".equals(scopeType)) {
				scopeRule.setCategory(mapCategory(rs));
			} else if ("BRAND".equals(scopeType)) {
				scopeRule.setBrand(mapBrand(rs));
			}
		}

		return scopeRule;
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

	private Category mapCategory(ResultSet rs) throws SQLException {
		Object categoryId = rs.getObject("category_id");
		if (categoryId == null) {
			return null;
		}

		Category category = new Category();
		category.setId(((Number) categoryId).intValue());
		category.setParent_id(getInteger(rs, "category_parent_id"));
		category.setCategory_name(rs.getString("category_name"));
		category.setCategory_slug(rs.getString("category_slug"));
		category.setCategory_icon(rs.getString("category_icon"));
		category.setLevel(getInteger(rs, "category_level"));
	//	category.setIs_active(getInteger(rs, "category_is_active"));
		category.setCreated_at(getDateTime(rs, "category_created_at"));
		category.setUpdated_at(getDateTime(rs, "category_updated_at"));
		return category;
	}

	private Brand mapBrand(ResultSet rs) throws SQLException {
		Object brandId = rs.getObject("brand_id");
		if (brandId == null) {
			return null;
		}

		Brand brand = new Brand();
		brand.setId(((Number) brandId).intValue());
		brand.setName(rs.getString("brand_name"));
		brand.setSlug(rs.getString("brand_slug"));
		brand.setLogo(rs.getString("brand_logo"));
		brand.setStatus(getInteger(rs, "brand_status"));
		return brand;
	}
}