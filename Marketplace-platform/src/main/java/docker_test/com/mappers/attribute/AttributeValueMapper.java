package docker_test.com.mappers.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.attribute.AttributeValue;
import docker_test.com.utils.StringValue;

public final class AttributeValueMapper implements IMapper<AttributeValue> {

    @Override
    public AttributeValue RowMap(ResultSet rs) {
        AttributeValue attrValue = new AttributeValue();
        try {
            attrValue.setId(rs.getInt(StringValue.ATTR_VALUE_ID_COL));
            attrValue.setAttributeId(rs.getInt(StringValue.ATTR_VALUE_ATTRIBUTE_ID_COL));
            
            // Xử lý Integer null (unitId có thể null trong DB)
            int unitId = rs.getInt(StringValue.ATTR_VALUE_UNIT_ID_COL);
            if (!rs.wasNull()) {
                attrValue.setUnit_id(unitId);
            } else {
                attrValue.setUnit_id(null);
            }
            
            attrValue.setValue(rs.getString(StringValue.ATTR_VALUE_VALUE_COL));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return attrValue;
    }

    @Override
    public List<AttributeValue> RowsMap(ResultSet rs) {
        List<AttributeValue> list = new ArrayList<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public AttributeValue mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}