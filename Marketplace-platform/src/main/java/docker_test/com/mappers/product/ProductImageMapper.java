package docker_test.com.mappers.product;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.product.ProductImage;
import docker_test.com.utils.StringValue;

public final class ProductImageMapper implements IMapper<ProductImage> {

    @Override
    public ProductImage RowMap(ResultSet rs) {
        ProductImage image = new ProductImage();
        try {
            image.setImageId(rs.getLong(StringValue.PRODUCT_IMAGE_ID_COL));
            image.setProductId(rs.getLong(StringValue.PRODUCT_IMAGE_PRODUCT_ID_COL));
            image.setImageUrl(rs.getString(StringValue.PRODUCT_IMAGE_URL_COL));
            image.setDisplayOrder(rs.getInt(StringValue.PRODUCT_IMAGE_DISPLAY_ORDER_COL));     
            image.setThumbnail(rs.getInt(StringValue.PRODUCT_IMAGE_THUMBNAIL_COL));

            Timestamp createdAt = rs.getTimestamp(StringValue.PRODUCT_IMAGE_CREATED_AT_COL);
            if (createdAt != null) image.setCreatedAt(createdAt.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return image;
    }

    @Override
    public List<ProductImage> RowsMap(ResultSet rs) {
        List<ProductImage> list = new ArrayList<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public ProductImage mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}