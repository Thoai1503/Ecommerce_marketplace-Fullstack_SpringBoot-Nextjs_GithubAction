package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.Voucher;
import docker_test.com.utils.StringValue;

public final class VoucherMapper implements IMapper<Voucher> {

    @Override
    public Voucher RowMap(ResultSet rs) {
        Voucher voucher = new Voucher();
        try {
            voucher.setVoucherId(rs.getLong(StringValue.VOUCHER_ID_COL));
            
            long shopId = rs.getLong(StringValue.VOUCHER_SHOP_ID_COL);
            if(!rs.wasNull()) voucher.setShopId(shopId);

            voucher.setVoucherCode(rs.getString(StringValue.VOUCHER_CODE_COL));
            voucher.setVoucherName(rs.getString(StringValue.VOUCHER_NAME_COL));
            voucher.setDescription(rs.getString(StringValue.VOUCHER_DESCRIPTION_COL));
            voucher.setDiscountType(rs.getString(StringValue.VOUCHER_DISCOUNT_TYPE_COL));
            voucher.setDiscountValue(rs.getDouble(StringValue.VOUCHER_DISCOUNT_VALUE_COL));
            voucher.setMinOrderValue(rs.getDouble(StringValue.VOUCHER_MIN_ORDER_VALUE_COL));
            voucher.setMaxDiscount(rs.getDouble(StringValue.VOUCHER_MAX_DISCOUNT_COL));
            
            int usageLimit = rs.getInt(StringValue.VOUCHER_USAGE_LIMIT_COL);
            if(!rs.wasNull()) voucher.setUsageLimit(usageLimit);
            
            voucher.setUsedCount(rs.getInt(StringValue.VOUCHER_USED_COUNT_COL));
            voucher.setActive(rs.getInt(StringValue.VOUCHER_ACTIVE_COL));

            Timestamp start = rs.getTimestamp(StringValue.VOUCHER_START_DATE_COL);
            if (start != null) voucher.setStartDate(start.toLocalDateTime());

            Timestamp end = rs.getTimestamp(StringValue.VOUCHER_END_DATE_COL);
            if (end != null) voucher.setEndDate(end.toLocalDateTime());

            Timestamp created = rs.getTimestamp(StringValue.VOUCHER_CREATED_AT_COL);
            if (created != null) voucher.setCreatedAt(created.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return voucher;
    }

    @Override
    public HashSet<Voucher> RowsMap(ResultSet rs) {
        HashSet<Voucher> list = new HashSet<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}