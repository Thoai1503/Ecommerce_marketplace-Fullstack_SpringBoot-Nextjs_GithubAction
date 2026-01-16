package docker_test.com.mappers.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.attribute.Attribute;
import docker_test.com.utils.StringValue;

public final class AttributeMapper implements IMapper<Attribute> {

    @Override
    public Attribute RowMap(ResultSet rs) {
        Attribute attribute = new Attribute();
        try {
            attribute.setId(rs.getInt(StringValue.ATTRIBUTE_ID_COL));
            attribute.setName(rs.getString(StringValue.ATTRIBUTE_NAME_COL));
            attribute.setSlug(rs.getString(StringValue.ATTRIBUTE_SLUG_COL));
            attribute.setData_type(rs.getInt(StringValue.ATTRIBUTE_DATA_TYPE_COL));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return attribute;
    }

    @Override
    public HashSet<Attribute> RowsMap(ResultSet rs) {
        HashSet<Attribute> list = new HashSet<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public Attribute mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}