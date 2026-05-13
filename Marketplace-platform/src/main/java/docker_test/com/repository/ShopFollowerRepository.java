package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import docker_test.com.configs.DBConnection;

public class ShopFollowerRepository {

    private static ShopFollowerRepository instance = null;
    private final DBConnection dbConnection;

    private ShopFollowerRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static ShopFollowerRepository Instance() {
        if (instance == null) {
            instance = new ShopFollowerRepository();
        }
        return instance;
    }

    public boolean FollowShop(long userId, long shopId) {
        String sql = """
                INSERT INTO shop_follower (user_id, shop_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE followed_at = followed_at
                """;

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, shopId);
            ps.executeUpdate();
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public boolean UnfollowShop(long userId, long shopId) {
        String sql = "DELETE FROM shop_follower WHERE user_id = ? AND shop_id = ?";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, shopId);
            ps.executeUpdate();
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public boolean IsFollowing(long userId, long shopId) {
        String sql = "SELECT 1 FROM shop_follower WHERE user_id = ? AND shop_id = ? LIMIT 1";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, shopId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return false;
    }

    public int CountFollowers(long shopId) {
        String sql = "SELECT COUNT(*) AS total FROM shop_follower WHERE shop_id = ?";

        try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, shopId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("total");
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return 0;
    }
}
