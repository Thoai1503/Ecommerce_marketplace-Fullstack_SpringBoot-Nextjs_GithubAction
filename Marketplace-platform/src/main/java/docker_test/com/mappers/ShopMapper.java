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

        shop.setId(rs.getLong("id"));
        shop.setUser_id(rs.getLong("user_id"));

        shop.setShop_name(rs.getString("shop_name"));
        shop.setShop_description(rs.getString("shop_description"));
        shop.setShop_logo(rs.getString("shop_logo"));
        shop.setShop_banner(rs.getString("shop_banner"));
        shop.setOwner_name(rs.getString("owner_name"));
        shop.setUrl_card_front(rs.getString("url_card_front"));
        shop.setUrl_card_back(rs.getString("url_card_back"));

        shop.setBusiness_license(rs.getString("business_license"));
        shop.setTax_code(rs.getString("tax_code"));

        shop.setRating(rs.getDouble("rating"));
        shop.setTotal_products(rs.getInt("total_products"));
        shop.setTotal_orders(rs.getInt("total_orders"));

        shop.setResponse_rate(rs.getDouble("response_rate"));
        shop.setResponse_time(rs.getInt("response_time"));

        shop.setIs_verified(rs.getInt("is_verified"));
        shop.setIs_active(rs.getInt("is_active"));

        if (rs.getTimestamp("created_at") != null) {
            shop.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
        }

        if (rs.getTimestamp("updated_at") != null) {
            shop.setUpdated_at(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        Object onboardingStep = rs.getObject("onboarding_step");
        if (onboardingStep != null) {
            shop.setOnboarding_step(((Number) onboardingStep).intValue());
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
        Shop shop = new Shop();

        shop.setId(rs.getLong("id"));
        shop.setUser_id(rs.getLong("user_id"));
        shop.setShop_name(rs.getString("shop_name"));
        shop.setShop_description(rs.getString("shop_description"));
        shop.setShop_logo(rs.getString("shop_logo"));
        shop.setShop_banner(rs.getString("shop_banner"));
        shop.setOwner_name(rs.getString("owner_name"));
        shop.setUrl_card_front(rs.getString("url_card_front"));
        shop.setUrl_card_back(rs.getString("url_card_back"));

        shop.setBusiness_license(rs.getString("business_license"));
        shop.setTax_code(rs.getString("tax_code"));

        shop.setRating(rs.getDouble("rating"));
        shop.setTotal_products(rs.getInt("total_products"));
        shop.setTotal_orders(rs.getInt("total_orders"));

        shop.setResponse_rate(rs.getDouble("response_rate"));
        shop.setResponse_time(rs.getInt("response_time"));

        shop.setIs_verified(rs.getInt("is_verified"));
        shop.setIs_active(rs.getInt("is_active"));

        if (rs.getTimestamp("created_at") != null) {
            shop.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
        }

        if (rs.getTimestamp("updated_at") != null) {
            shop.setUpdated_at(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        Object onboardingStep = rs.getObject("onboarding_step");
        if (onboardingStep != null) {
            shop.setOnboarding_step(((Number) onboardingStep).intValue());
        }

        return shop;
    }
}
