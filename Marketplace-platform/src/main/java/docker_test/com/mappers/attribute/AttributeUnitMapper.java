package docker_test.com.mappers.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.attribute.AttributeUnit;
import docker_test.com.utils.StringValue;

public final class AttributeUnitMapper implements IMapper<AttributeUnit> {

    @Override
    public AttributeUnit RowMap(ResultSet rs) {
        AttributeUnit unit = new AttributeUnit();
        try {
            unit.setId(rs.getInt(StringValue.ATTR_UNIT_ID_COL));
            unit.setAttributeId(rs.getInt(StringValue.ATTR_UNIT_ATTRIBUTE_ID_COL));
            unit.setUnitId(rs.getInt(StringValue.ATTR_UNIT_UNIT_ID_COL));
            unit.setStatus(rs.getInt(StringValue.ATTR_UNIT_STATUS_COL));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return unit;
    }

    @Override
    public HashSet<AttributeUnit> RowsMap(ResultSet rs) {
        HashSet<AttributeUnit> list = new HashSet<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}