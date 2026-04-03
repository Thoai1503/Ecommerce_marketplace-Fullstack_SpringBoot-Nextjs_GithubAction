package docker_test.com.mappers.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.attribute.AttributeValue;
import docker_test.com.utils.StringValue;

public final class AttributeValueMapper implements IMapper<AttributeValue> {

    public static AttributeValue map(ResultSet rs) throws SQLException {
        AttributeValue item = new AttributeValue();

        item.setId(rs.getInt(StringValue.ATTR_VALUE_ID_COL));
        item.setAttribute_id(rs.getInt(StringValue.ATTR_VALUE_ATTRIBUTE_ID_COL));

        int unitId = rs.getInt(StringValue.ATTR_VALUE_UNIT_ID_COL);
        if (rs.wasNull()) {
            item.setUnit_id(null);
        } else {
            item.setUnit_id(unitId);
        }

        item.setValue(rs.getString(StringValue.ATTR_VALUE_VALUE_COL));

        return item;
    }

    @Override
    public AttributeValue RowMap(ResultSet rs) {
        try {
            return map(rs);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<AttributeValue> RowsMap(ResultSet rs) {
        List<AttributeValue> list = new ArrayList<>();
        try {
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    @Override
    public AttributeValue mapRow(ResultSet rs, int rowNum) throws SQLException {
        return map(rs);
    }
}