package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherCondition;
import docker_test.com.utils.StringValue;

public final class VoucherConditionMapper implements IMapper<VoucherCondition> {

    @Override
    public VoucherCondition RowMap(ResultSet rs) {
        VoucherCondition condition = new VoucherCondition();
        try {
            condition.setConditionId(rs.getLong(StringValue.VOUCHER_COND_ID_COL));
            condition.setVoucherId(rs.getLong(StringValue.VOUCHER_COND_VOUCHER_ID_COL));
            condition.setConditionTypeId(rs.getInt(StringValue.VOUCHER_COND_TYPES_ID_COL));
            condition.setOperator(rs.getString(StringValue.VOUCHER_COND_OPERATOR_COL));
            
            // Xử lý Double null
            double valNum = rs.getDouble(StringValue.VOUCHER_COND_VALUE_NUMERIC_COL);
            if(!rs.wasNull()) condition.setValueNumeric(valNum);

            double valNumMax = rs.getDouble(StringValue.VOUCHER_COND_VALUE_NUMERIC_MAX_COL);
            if(!rs.wasNull()) condition.setValueNumericMax(valNumMax);
            
            condition.setValueText(rs.getString(StringValue.VOUCHER_COND_VALUE_TEXT_COL));
            condition.setValueJson(rs.getString(StringValue.VOUCHER_COND_VALUE_JSON_COL));
            
            // boolean
            condition.setRequired(rs.getBoolean(StringValue.VOUCHER_COND_REQUIRED_COL));
            
            condition.setPriority(rs.getInt(StringValue.VOUCHER_COND_PRIORITY_COL));
            condition.setErrorMessage(rs.getString(StringValue.VOUCHER_COND_ERROR_MESSAGE_COL));

            Timestamp createdAt = rs.getTimestamp(StringValue.VOUCHER_COND_CREATED_AT_COL);
            if (createdAt != null) condition.setCreatedAt(createdAt.toLocalDateTime());

            Timestamp updatedAt = rs.getTimestamp(StringValue.VOUCHER_COND_UPDATED_AT_COL);
            if (updatedAt != null) condition.setUpdatedAt(updatedAt.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return condition;
    }

    @Override
    public List<VoucherCondition> RowsMap(ResultSet rs) {
        List<VoucherCondition> list = new ArrayList<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public VoucherCondition mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}