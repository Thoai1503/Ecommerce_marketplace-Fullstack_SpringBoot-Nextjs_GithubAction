package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;

import docker_test.com.models.Shop;

public class ShopMapper {

    /* ================= MAP SINGLE ROW ================= */
    public Shop RowMap(ResultSet rs) throws SQLException {

        Shop shop = new Shop();

        shop.setShopId(rs.getLong("shop_id"));
        shop.setUserId(rs.getLong("user_id"));

        shop.setShopName(rs.getString("shop_name"));
        shop.setShopDescription(rs.getString("shop_description"));
        shop.setShopLogo(rs.getString("shop_logo"));
        shop.setShopBanner(rs.getString("shop_banner"));

        shop.setBusinessLicense(rs.getString("business_license"));
        shop.setTaxCode(rs.getString("tax_code"));

        shop.setRating(rs.getBigDecimal("rating"));
        shop.setTotalProducts(rs.getInt("total_products"));
        shop.setTotalOrders(rs.getInt("total_orders"));

        shop.setResponseRate(rs.getBigDecimal("response_rate"));
        shop.setResponseTime(rs.getInt("response_time"));

        shop.setIsVerified(rs.getInt("is_verified"));
        shop.setIsActive(rs.getInt("is_active"));

        if (rs.getTimestamp("created_at") != null) {
            shop.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }

        if (rs.getTimestamp("updated_at") != null) {
            shop.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return shop;
    }

    /* ================= MAP MULTIPLE ROWS ================= */
    public HashSet<Shop> RowsMap(ResultSet rs) throws SQLException {

        HashSet<Shop> list = new HashSet<>();

        while (rs.next()) {
            list.add(RowMap(rs));
        }

        return list;
    }
}
