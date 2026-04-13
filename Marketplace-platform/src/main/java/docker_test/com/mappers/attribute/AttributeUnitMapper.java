package docker_test.com.mappers.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import docker_test.com.models.attribute.AttributeUnit;
import docker_test.com.utils.StringValue;

public final class AttributeUnitMapper {

    public static AttributeUnit map(ResultSet rs) throws SQLException {
        return new AttributeUnit(
            rs.getObject(StringValue.ATTR_UNIT_ID_COL, Integer.class), // ✅ tránh null = 0
            rs.getInt(StringValue.ATTR_UNIT_ATTRIBUTE_ID_COL),
            rs.getInt(StringValue.ATTR_UNIT_UNIT_ID_COL),
            rs.getInt(StringValue.ATTR_UNIT_STATUS_COL)
        );
    }
}