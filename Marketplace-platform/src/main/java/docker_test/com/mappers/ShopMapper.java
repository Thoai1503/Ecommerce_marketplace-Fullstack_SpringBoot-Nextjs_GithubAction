package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.jdbc.core.RowMapper;

import docker_test.com.models.Shop;

public class ShopMapper implements RowMapper<Shop> {

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

        shop.setRating(rs.getDouble("rating"));
        shop.setTotalProducts(rs.getInt("total_products"));
        shop.setTotalOrders(rs.getInt("total_orders"));

        shop.setResponseRate(rs.getDouble("response_rate"));
        shop.setResponseTime(rs.getInt("response_time"));

        shop.setVerified(rs.getInt("is_verified"));
        shop.setActive(rs.getInt("is_active"));

        if (rs.getTimestamp("created_at") != null) {
            shop.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }

        if (rs.getTimestamp("updated_at") != null) {
            shop.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return shop;
    }

    /* ================= MAP MULTIPLE ROWS ================= */
    public List<Shop> RowsMap(ResultSet rs) throws SQLException {

     List<Shop> list = new ArrayList<>();

        while (rs.next()) {
            list.add(RowMap(rs));
        }

        return list;
    }

	@Override
	public Shop mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}
