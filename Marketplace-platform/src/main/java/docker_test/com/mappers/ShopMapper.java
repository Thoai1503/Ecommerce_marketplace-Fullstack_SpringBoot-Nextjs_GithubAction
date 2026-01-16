package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;

import docker_test.com.models.Shop; // Giả định package
import docker_test.com.utils.StringValue;

public final class ShopMapper implements IMapper<Shop> {

    @Override
    public Shop RowMap(ResultSet rs) {
        Shop shop = new Shop();
        try {
            shop.setShopId(rs.getLong(StringValue.SHOP_ID_COL));
            shop.setUserId(rs.getLong(StringValue.SHOP_USER_ID_COL));
            shop.setShopName(rs.getString(StringValue.SHOP_NAME_COL));
            shop.setShopDescription(rs.getString(StringValue.SHOP_DESCRIPTION_COL));
            shop.setShopLogo(rs.getString(StringValue.SHOP_LOGO_COL));
            shop.setShopBanner(rs.getString(StringValue.SHOP_BANNER_COL));
            shop.setBusinessLicense(rs.getString(StringValue.SHOP_BUSINESS_LICENSE_COL));
            shop.setTaxCode(rs.getString(StringValue.SHOP_TAX_CODE_COL));
            shop.setRating(rs.getDouble(StringValue.SHOP_RATING_COL));
            shop.setTotalProducts(rs.getInt(StringValue.SHOP_TOTAL_PRODUCTS_COL));
            shop.setTotalOrders(rs.getInt(StringValue.SHOP_TOTAL_ORDERS_COL));	
            shop.setResponseRate(rs.getDouble(StringValue.SHOP_RESPONSE_RATE_COL));
            shop.setResponseTime(rs.getInt(StringValue.SHOP_RESPONSE_TIME_COL));
            shop.setVerified(rs.getInt(StringValue.SHOP_VERIFIED_COL));
            shop.setActive(rs.getInt(StringValue.SHOP_ACTIVE_COL));

            Timestamp createdAt = rs.getTimestamp(StringValue.SHOP_CREATED_AT_COL);
            if (createdAt != null) shop.setCreatedAt(createdAt.toLocalDateTime());

            Timestamp updatedAt = rs.getTimestamp(StringValue.SHOP_UPDATED_AT_COL);
            if (updatedAt != null) shop.setUpdatedAt(updatedAt.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return shop;
    }

    @Override
    public HashSet<Shop> RowsMap(ResultSet rs) {
        HashSet<Shop> list = new HashSet<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}