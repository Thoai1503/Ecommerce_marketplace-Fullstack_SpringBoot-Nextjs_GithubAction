package docker_test.com.dto;

import java.util.ArrayList;
import java.util.List;

public class ProductStatsResponse {
    public RevenueStats revenue = new RevenueStats();
    public OrderStats orders = new OrderStats();
    public ViewStats views = new ViewStats();
    public StockStats stockVelocity = new StockStats();
    public List<TopBuyer> topBuyers = new ArrayList<>();

    public static class TrendPoint {
        public String date;
        public double value;

        public TrendPoint() {}

        public TrendPoint(String date, double value) {
            this.date = date;
            this.value = value;
        }
    }

    public static class RevenueStats {
        public double total;
        public List<TrendPoint> trend = new ArrayList<>();
        public double comparePrev;
    }

    public static class OrderStats {
        public long total;
        public List<Long> byDayOfWeek = List.of(0L, 0L, 0L, 0L, 0L, 0L, 0L);
    }

    public static class ViewStats {
        public long total;
        public long uniqueVisitors;
        public List<TrendPoint> trend = new ArrayList<>();
    }

    public static class StockStats {
        public double avgPerDay;
        public Integer daysRemaining;
        public int currentStock;
    }

    public static class TopBuyer {
        public long userId;
        public String name;
        public long orderCount;
        public double totalSpent;
    }
}
