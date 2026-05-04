package docker_test.com.repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.dto.ProductStatsResponse;
import docker_test.com.dto.ProductStatsResponse.TopBuyer;
import docker_test.com.dto.ProductStatsResponse.TrendPoint;
import docker_test.com.models.product.Product;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class ProductStatsRepository {
    private static ProductStatsRepository instance;
    private final DBConnection dbConnection;
    private final ProductRepository productRepository;

    private ProductStatsRepository() {
        this.dbConnection = DBConnection.getInstance();
        this.productRepository = ProductRepository.Instance();
    }

    public static ProductStatsRepository Instance() {
        if (instance == null) instance = new ProductStatsRepository();
        return instance;
    }

    public ProductStatsResponse getStats(long productId, int days) {
        ProductStatsResponse response = new ProductStatsResponse();
        response.revenue.trend = revenueTrend(productId, days);
        response.revenue.total = response.revenue.trend.stream().mapToDouble(point -> point.value).sum();
        response.revenue.comparePrev = comparePreviousRevenue(productId, days, response.revenue.total);
        response.orders.total = orderTotal(productId, days);
        response.orders.byDayOfWeek = ordersByDayOfWeek(productId, days);
        response.views.trend = viewTrend(productId, days);
        response.views.total = Math.round(response.views.trend.stream().mapToDouble(point -> point.value).sum());
        response.views.uniqueVisitors = uniqueVisitors(productId, days);
        response.stockVelocity = stockStats(productId, days);
        response.topBuyers = topBuyers(productId, days);
        return response;
    }

    public void recordView(long productId, Long userId, String ipAddress, String userAgent) {
        String sql = """
            INSERT INTO product_view (product_id, user_id, ip_address, user_agent)
            VALUES (?, ?, ?, ?)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            if (userId != null) ps.setLong(2, userId);
            else ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, ipAddress);
            ps.setString(4, userAgent != null && userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent);
            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatsRepository.recordView] failed: " + e.getMessage(), e);
        }
    }

    private List<TrendPoint> revenueTrend(long productId, int days) {
        String sql = """
            SELECT DATE(created_at) AS stat_date, COALESCE(SUM(total_price), 0) AS value
            FROM order_item
            WHERE product_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
        """;
        return fillDailyTrend(queryDailyDouble(sql, productId, days), days);
    }

    private List<TrendPoint> viewTrend(long productId, int days) {
        String sql = """
            SELECT DATE(viewed_at) AS stat_date, COUNT(*) AS value
            FROM product_view
            WHERE product_id = ? AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(viewed_at)
        """;
        return fillDailyTrend(queryDailyDouble(sql, productId, days), days);
    }

    private double comparePreviousRevenue(long productId, int days, double currentTotal) {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0) AS revenue
            FROM order_item
            WHERE product_id = ?
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
              AND created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)
        """;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setInt(2, days * 2);
            ps.setInt(3, days);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    double previous = rs.getDouble("revenue");
                    if (previous <= 0) return currentTotal > 0 ? 1 : 0;
                    return (currentTotal - previous) / previous;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatsRepository.comparePreviousRevenue] failed: " + e.getMessage(), e);
        }
        return 0;
    }

    private long orderTotal(long productId, int days) {
        String sql = """
            SELECT COUNT(DISTINCT order_id) AS order_count
            FROM order_item
            WHERE product_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        """;
        return queryLong(sql, productId, days, "order_count");
    }

    private List<Long> ordersByDayOfWeek(long productId, int days) {
        List<Long> values = new ArrayList<>(List.of(0L, 0L, 0L, 0L, 0L, 0L, 0L));
        String sql = """
            SELECT DAYOFWEEK(created_at) AS day_index, COUNT(DISTINCT order_id) AS order_count
            FROM order_item
            WHERE product_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DAYOFWEEK(created_at)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setInt(2, days);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int mysqlDay = rs.getInt("day_index");
                    int mondayFirstIndex = mysqlDay == 1 ? 6 : mysqlDay - 2;
                    values.set(mondayFirstIndex, rs.getLong("order_count"));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatsRepository.ordersByDayOfWeek] failed: " + e.getMessage(), e);
        }
        return values;
    }

    private long uniqueVisitors(long productId, int days) {
        String sql = """
            SELECT COUNT(DISTINCT COALESCE(CAST(user_id AS CHAR), ip_address)) AS unique_visitors
            FROM product_view
            WHERE product_id = ? AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        """;
        return queryLong(sql, productId, days, "unique_visitors");
    }

    private ProductStatsResponse.StockStats stockStats(long productId, int days) {
        ProductStatsResponse.StockStats stats = new ProductStatsResponse.StockStats();
        Product product = productRepository.GetById((int) productId);
        stats.currentStock = product != null && product.getStock_quantity() != null ? product.getStock_quantity() : 0;

        String sql = """
            SELECT COALESCE(SUM(quantity), 0) AS sold_qty
            FROM order_item
            WHERE product_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        """;
        long soldQty = queryLong(sql, productId, days, "sold_qty");
        stats.avgPerDay = days > 0 ? Math.round((soldQty / (double) days) * 10.0) / 10.0 : 0;
        stats.daysRemaining = stats.avgPerDay > 0
                ? (int) Math.ceil(stats.currentStock / stats.avgPerDay)
                : null;
        return stats;
    }

    private List<TopBuyer> topBuyers(long productId, int days) {
        String sql = """
            SELECT
                o.user_id,
                u.full_name,
                COUNT(DISTINCT oi.order_id) AS order_count,
                COALESCE(SUM(oi.total_price), 0) AS total_spent
            FROM order_item oi
            JOIN orders o ON o.id = oi.order_id
            LEFT JOIN user u ON u.id = o.user_id
            WHERE oi.product_id = ? AND oi.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY o.user_id, u.full_name
            ORDER BY total_spent DESC
            LIMIT 5
        """;

        List<TopBuyer> buyers = new ArrayList<>();
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setInt(2, days);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    TopBuyer buyer = new TopBuyer();
                    buyer.userId = rs.getLong("user_id");
                    buyer.name = rs.getString("full_name");
                    buyer.orderCount = rs.getLong("order_count");
                    buyer.totalSpent = rs.getDouble("total_spent");
                    buyers.add(buyer);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatsRepository.topBuyers] failed: " + e.getMessage(), e);
        }
        return buyers;
    }

    private Map<LocalDate, Double> queryDailyDouble(String sql, long productId, int days) {
        Map<LocalDate, Double> values = new HashMap<>();
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setInt(2, days);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    values.put(rs.getDate("stat_date").toLocalDate(), rs.getDouble("value"));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatsRepository.queryDailyDouble] failed: " + e.getMessage(), e);
        }
        return values;
    }

    private long queryLong(String sql, long productId, int days, String column) {
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setInt(2, days);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(column);
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductStatsRepository.queryLong] failed: " + e.getMessage(), e);
        }
        return 0;
    }

    private List<TrendPoint> fillDailyTrend(Map<LocalDate, Double> values, int days) {
        Map<LocalDate, Double> ordered = new TreeMap<>();
        LocalDate start = LocalDate.now().minusDays(Math.max(days - 1, 0));
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            ordered.put(day, values.getOrDefault(day, 0.0));
        }

        List<TrendPoint> trend = new ArrayList<>();
        ordered.forEach((date, value) -> trend.add(new TrendPoint(date.toString(), value)));
        return trend;
    }
}
