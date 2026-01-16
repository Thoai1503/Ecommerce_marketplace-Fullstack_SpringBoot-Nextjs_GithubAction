package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherConditionType;
import docker_test.com.utils.StringValue;

public final class VoucherConditionTypeMapper implements IMapper<VoucherConditionType> {
	@Override
	public VoucherConditionType RowMap(ResultSet rs) {
		VoucherConditionType conditionType = new VoucherConditionType();
		try {
			conditionType.setTypeId(rs.getInt(StringValue.VOUCHER_COND_TYPE_ID_COL));
			conditionType.setCode(rs.getString(StringValue.VOUCHER_COND_TYPE_CODE_COL));
			conditionType.setTypeName(rs.getString(StringValue.VOUCHER_COND_TYPE_NAME_COL));
			conditionType.setDescription(rs.getString(StringValue.VOUCHER_COND_TYPE_DESC_COL));
			//conditionType.set(rs.getInt(StringValue.PRODUCT_ACTIVE_COL));

            Timestamp createdAt = rs.getTimestamp(StringValue.VOUCHER_COND_CREATED_AT_COL);
            if (createdAt != null) conditionType.setCreatedAt(createdAt.toLocalDateTime());

		} catch (SQLException e) {
			e.printStackTrace();
		}
		return conditionType;
	}

	@Override
	public HashSet<VoucherConditionType> RowsMap(ResultSet rs) {
		HashSet<VoucherConditionType> list = new HashSet<>();
		try {
			while (rs.next()) list.add(RowMap(rs));
		} catch (SQLException e) {
			e.printStackTrace();

}
		return list;
	}
}
