package docker_test.com.mappers.attribute;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.attribute.Attribute;
import docker_test.com.utils.StringValue;

public final class AttributeMapper implements IMapper<Attribute> {

    private Attribute map(ResultSet rs) throws SQLException {
        Attribute attribute = new Attribute();

        attribute.setId(rs.getInt(StringValue.ATTRIBUTE_ID_COL));
        attribute.setName(rs.getString(StringValue.ATTRIBUTE_NAME_COL));
        attribute.setSlug(rs.getString(StringValue.ATTRIBUTE_SLUG_COL));
        attribute.setStatus(rs.getInt(StringValue.ATTRIBUTE_STATUS_COL));

        return attribute;
    }

    @Override
    public Attribute RowMap(ResultSet rs) {
        try {
            return map(rs);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Attribute> RowsMap(ResultSet rs) {
        List<Attribute> list = new ArrayList<>();
        try {
            while (rs.next()) {
                list.add(map(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    @Override
    public Attribute mapRow(ResultSet rs, int rowNum) throws SQLException {
        return map(rs);
    }
}