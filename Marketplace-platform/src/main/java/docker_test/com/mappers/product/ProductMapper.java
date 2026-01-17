package docker_test.com.mappers.product;


import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.product.Product;
import docker_test.com.utils.StringValue;

public final class ProductMapper implements IMapper<Product> {

    @Override
    public Product RowMap(ResultSet rs) {
        Product product = new Product();
        try {
            product.setId(rs.getInt(StringValue.PRODUCT_ID_COL));
            product.setShopId(rs.getLong(StringValue.PRODUCT_SHOP_ID_COL));
            product.setCategoryId(rs.getLong(StringValue.PRODUCT_CATEGORY_ID_COL));
            product.setProductName(rs.getString(StringValue.PRODUCT_NAME_COL));
            product.setProductSlug(rs.getString(StringValue.PRODUCT_SLUG_COL));
            product.setDescription(rs.getString(StringValue.PRODUCT_DESCRIPTION_COL));
            
            // Các trường số thực (Double)
            product.setPrice(rs.getDouble(StringValue.PRODUCT_PRICE_COL));
            product.setOriginalPrice(rs.getDouble(StringValue.PRODUCT_ORIGINAL_PRICE_COL));
            
            product.setStockQuantity(rs.getInt(StringValue.PRODUCT_STOCK_QUANTITY_COL));
            product.setSoldCount(rs.getInt(StringValue.PRODUCT_SOLD_COUNT_COL));
            
            product.setRating(rs.getDouble(StringValue.PRODUCT_RATING_COL));
            product.setReviewCount(rs.getInt(StringValue.PRODUCT_REVIEW_COUNT_COL));
            
            // Kích thước / Cân nặng
            product.setWeight(rs.getDouble(StringValue.PRODUCT_WEIGHT_COL));
            product.setLength(rs.getDouble(StringValue.PRODUCT_LENGTH_COL));
            product.setWidth(rs.getDouble(StringValue.PRODUCT_WIDTH_COL));
            product.setHeight(rs.getDouble(StringValue.PRODUCT_HEIGHT_COL));
            
            product.setBrand(rs.getString(StringValue.PRODUCT_BRAND_COL));
            product.setIs_active(rs.getInt(StringValue.PRODUCT_ACTIVE_COL));

            // Timestamp -> LocalDateTime
            Timestamp createdAt = rs.getTimestamp(StringValue.PRODUCT_CREATED_AT_COL);
            if (createdAt != null) {
                product.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp(StringValue.PRODUCT_UPDATED_AT_COL);
            if (updatedAt != null) {
                product.setUpdatedAt(updatedAt.toLocalDateTime());
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return product;
    }

    @Override
    public HashSet<Product> RowsMap(ResultSet rs) {
        HashSet<Product> products = new HashSet<>();
        try {
            while (rs.next()) {
                products.add(RowMap(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return products;
    }

	@Override
	public Product mapRow(ResultSet rs, int rowNum) throws SQLException {
		System.out.println("Execute..");
		Product product =new Product();
		product.setId(rs.getInt("Id"));
		product.setProductName(rs.getString("Name"));
		return null;
	}
}