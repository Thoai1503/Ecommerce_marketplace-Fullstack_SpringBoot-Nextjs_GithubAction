package docker_test.com.mappers.product;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.product.ProductAttribute;
import docker_test.com.utils.StringValue;

public final class ProductAttributeMapper implements IMapper<ProductAttribute> {

    @Override
    public ProductAttribute RowMap(ResultSet rs) {
        ProductAttribute prodAttr = new ProductAttribute();
        try {
            prodAttr.setId(rs.getInt(StringValue.PROD_ATTR_ID_COL));
            prodAttr.setProductId(rs.getInt(StringValue.PROD_ATTR_PRODUCT_ID_COL));
            prodAttr.setAttributeId(rs.getInt(StringValue.PROD_ATTR_ATTRIBUTE_ID_COL));
            
            int attrValId = rs.getInt(StringValue.PROD_ATTR_VALUE_ID_COL);
            if (!rs.wasNull()) prodAttr.setAttributeValueId(attrValId);

            prodAttr.setValueText(rs.getString(StringValue.PROD_ATTR_VALUE_TEXT_COL));
            
            double valNum = rs.getDouble(StringValue.PROD_ATTR_VALUE_NUMBER_COL);
            if (!rs.wasNull()) prodAttr.setValueNumber(valNum);

            // Date -> LocalDate
            Date dateVal = rs.getDate(StringValue.PROD_ATTR_VALUE_DATE_COL);
            if (dateVal != null) prodAttr.setValueDate(dateVal.toLocalDate());

            int unitId = rs.getInt(StringValue.PROD_ATTR_UNIT_ID_COL);
            if (!rs.wasNull()) prodAttr.setUnitId(unitId);

            Timestamp createdAt = rs.getTimestamp(StringValue.PROD_ATTR_CREATED_AT_COL);
            if (createdAt != null) prodAttr.setCreatedAt(createdAt.toLocalDateTime());

            Timestamp updatedAt = rs.getTimestamp(StringValue.PROD_ATTR_UPDATED_AT_COL);
            if (updatedAt != null) prodAttr.setUpdatedAt(updatedAt.toLocalDateTime());

            prodAttr.setAttributeName(readString(rs, "attribute_name"));
            prodAttr.setAttributeSlug(readString(rs, "attribute_slug"));
            prodAttr.setAttributeValue(readString(rs, "attribute_value"));
            prodAttr.setUnitLabel(readString(rs, "unit_label"));
            prodAttr.setUnitSymbol(readString(rs, "unit_symbol"));

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return prodAttr;
    }

    private String readString(ResultSet rs, String columnName) throws SQLException {
        try {
            return rs.getString(columnName);
        } catch (SQLException ignored) {
            return null;
        }
    }

    @Override
    public List<ProductAttribute> RowsMap(ResultSet rs) {
        List<ProductAttribute> list = new ArrayList<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public ProductAttribute mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}
