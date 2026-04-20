package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.Voucher;
import docker_test.com.models.voucher.DiscountType;
import docker_test.com.utils.StringValue;

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
		Voucher voucher = new Voucher();

		voucher.setId(rs.getLong(StringValue.VOUCHER_ID_COL));

		// shop_id (nullable)
		Long shopId = (Long) rs.getObject(StringValue.VOUCHER_SHOP_ID_COL);
		voucher.setShopId(shopId);

		voucher.setVoucherCode(rs.getString(StringValue.VOUCHER_CODE_COL));
		voucher.setVoucherName(rs.getString(StringValue.VOUCHER_NAME_COL));
		voucher.setDescription(rs.getString(StringValue.VOUCHER_DESCRIPTION_COL));

		// ENUM
		String type = rs.getString(StringValue.VOUCHER_DISCOUNT_TYPE_COL);
		voucher.setDiscountType(DiscountType.fromDb(type));

		// BigDecimal (chuẩn)
		voucher.setDiscountValue(rs.getBigDecimal(StringValue.VOUCHER_DISCOUNT_VALUE_COL));
		voucher.setMinOrderValue(rs.getBigDecimal(StringValue.VOUCHER_MIN_ORDER_VALUE_COL));
		voucher.setMaxDiscount(rs.getBigDecimal(StringValue.VOUCHER_MAX_DISCOUNT_COL));

		// usage_limit nullable
		voucher.setUsageLimit((Integer) rs.getObject(StringValue.VOUCHER_USAGE_LIMIT_COL));

		voucher.setUsedCount(rs.getInt(StringValue.VOUCHER_USED_COUNT_COL));

		// boolean
		voucher.setActive(rs.getInt(StringValue.VOUCHER_ACTIVE_COL) == 1);

		// time
		Timestamp start = rs.getTimestamp(StringValue.VOUCHER_START_DATE_COL);
		if (start != null)
			voucher.setStartDate(start.toLocalDateTime());

		Timestamp end = rs.getTimestamp(StringValue.VOUCHER_END_DATE_COL);
		if (end != null)
			voucher.setEndDate(end.toLocalDateTime());

		Timestamp created = rs.getTimestamp(StringValue.VOUCHER_CREATED_AT_COL);
		if (created != null)
			voucher.setCreatedAt(created.toLocalDateTime());

		return voucher;
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
}