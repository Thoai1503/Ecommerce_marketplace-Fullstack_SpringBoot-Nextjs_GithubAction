package docker_test.com.mappers.product;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.product.ProductVariant;
import docker_test.com.utils.StringValue;

public final class ProductVariantMapper implements IMapper<ProductVariant> {

    @Override
    public ProductVariant RowMap(ResultSet rs) {
        ProductVariant variant = new ProductVariant();
        try {
            variant.setVariant_id(rs.getInt(StringValue.VARIANT_ID_COL));
            variant.setProduct_id(rs.getInt(StringValue.VARIANT_PRODUCT_ID_COL));
            variant.setVariant_name(rs.getString(StringValue.VARIANT_NAME_COL));
            variant.setSku(rs.getString(StringValue.VARIANT_SKU_COL));
            variant.setPrice(rs.getDouble(StringValue.VARIANT_PRICE_COL));
            variant.setStock_quantity(rs.getInt(StringValue.VARIANT_STOCK_QUANTITY_COL));
            variant.setImage_url(rs.getString(StringValue.VARIANT_IMAGE_URL_COL));
            variant.setActive(rs.getInt(StringValue.VARIANT_ACTIVE_COL));

            Timestamp createdAt = rs.getTimestamp(StringValue.VARIANT_CREATED_AT_COL);
            if (createdAt != null) variant.setCreated_at(null);

            Timestamp updatedAt = rs.getTimestamp(StringValue.VARIANT_UPDATED_AT_COL);
            if (updatedAt != null) variant.setUpdated_at(updatedAt.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return variant;
    }

    @Override
    public List<ProductVariant> RowsMap(ResultSet rs) {
    	List<ProductVariant> list = new ArrayList<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public ProductVariant mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}