package docker_test.com.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.sql.Types;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Order;


public class OrderRepository implements IRepositories<Order>{

	private static OrderRepository instance=null;
	private DBConnection dbConnection;
	
	private OrderRepository() {
        this.dbConnection = DBConnection.getInstance();
    }
	
	public static OrderRepository Instance() {
        if (instance == null) {
            instance = new OrderRepository();
        }
        return instance;
    }
	
	public List<Order> findAllWithPagination(
	        Long userId,
	        LocalDateTime startDate,
	        LocalDateTime endDate,
	        Double minAmount,
	        Double maxAmount,
	        String status,
	        String sortBy,
	        String sortOrder,
	        int page,
	        int size
	) {

	    StringBuilder sql = new StringBuilder(
	            "SELECT o.* FROM `orders` o WHERE 1=1 "
	    );

	    List<Object> params = new ArrayList<>();

	    if (userId != null) {
	        sql.append("AND o.user_id = ? ");
	        params.add(userId);
	    }

	    if (startDate != null) {
	        sql.append("AND o.created_at >= ? ");
	        params.add(Timestamp.valueOf(startDate));
	    }

	    if (endDate != null) {
	        sql.append("AND o.created_at <= ? ");
	        params.add(Timestamp.valueOf(endDate));
	    }

	    if (minAmount != null) {
	        sql.append("AND o.final_amount >= ? ");
	        params.add(minAmount);
	    }

	    if (maxAmount != null) {
	        sql.append("AND o.final_amount <= ? ");
	        params.add(maxAmount);
	    }

//	    if (status != null && !status.equalsIgnoreCase("all")) {
//	        sql.append("AND o.order_status = ? ");
//	        params.add(status);
//	    }

	    String sortColumn = "o.created_at";
	    if ("amount".equalsIgnoreCase(sortBy)) {
	        sortColumn = "o.final_amount";
	    }

	    String direction = "ASC";
	    if ("desc".equalsIgnoreCase(sortOrder)) {
	        direction = "DESC";
	    }

//	    sql.append("ORDER BY ").append(sortColumn).append(" ").append(direction);

	    // Pagination
	    if (page < 1) page = 1;
	    int offset = (page - 1) * size;
	    sql.append(" LIMIT ? OFFSET ? ");
	    params.add(size);
	    params.add(offset);

	    List<Order> list = new ArrayList<>();

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql.toString())) {

	        for (int i = 0; i < params.size(); i++) {
	            ps.setObject(i + 1, params.get(i));
	        }

	        ResultSet rs = ps.executeQuery();

	        while (rs.next()) {
	            list.add(mapResultSetToOrder(rs));
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return list;
	}
	
	public Map<String, Integer> countByStatus() {

	    String sql = """
	            SELECT order_status, COUNT(*) total
	            FROM `orders`
	            GROUP BY order_status
	            """;

	    Map<String, Integer> map = new HashMap<>();

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql);
	         ResultSet rs = ps.executeQuery()) {

	        while (rs.next()) {
	            map.put(
	                    rs.getString("order_status"),
	                    rs.getInt("total")
	            );
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return map;
	}
	
	public Double getPendingTotalAmount() {

	    String sql = """
	            SELECT SUM(final_amount)
	            FROM `orders`
	            WHERE order_status = 'pending'
	            """;

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql);
	         ResultSet rs = ps.executeQuery()) {

	        if (rs.next()) {
	            return rs.getDouble(1);
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return 0.0;
	}
	
	@Override
	public Order Create(Order item) throws SQLException {
		 String sql = """
	                INSERT INTO orders (
	                    order_number, user_id, address_id,
	                    total_amount, shipping_fee, discount_amount, final_amount,
	                    payment_method, payment_status, order_status, note,
	                    voucher_id, tracking_number,
	                    created_at, updated_at
	                )
	                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	                """;

	        try (Connection conn = dbConnection.getConn();
	             PreparedStatement ps = conn.prepareStatement(sql)) {

	            ps.setString(1, item.getOrderNumber());
	            ps.setLong(2, item.getUserId());
	            ps.setLong(3, item.getShopId());
	            ps.setLong(4, item.getAddressId());
	            ps.setDouble(5, item.getTotalAmount());
	            ps.setDouble(6, item.getShippingFee());
	            ps.setDouble(7, item.getDiscountAmount());
	            ps.setDouble(8, item.getFinalAmount());
	            ps.setString(9, item.getPaymentMethod());
	            ps.setString(10, item.getPaymentStatus());
	            ps.setString(11, item.getOrderStatus());
	            ps.setString(12, item.getNote());
	            ps.setObject(13, item.getVoucherId());
	            ps.setString(14, item.getTrackingNumber());
	            ps.setTimestamp(15, Timestamp.valueOf(item.getCreatedAt()));
	            ps.setTimestamp(16, Timestamp.valueOf(item.getUpdatedAt()));

	            return ps.executeUpdate() > 0 ? item : null;

	        } catch (Exception e) {
	            e.printStackTrace();
	        }

	        return null;
	}


	public int countOrders(
	        Long userId,
	        LocalDateTime startDate,
	        LocalDateTime endDate,
	        Double minAmount,
	        Double maxAmount,
	        String status
	) {

	    StringBuilder sql = new StringBuilder(
	            "SELECT COUNT(*) FROM `orders` o WHERE 1=1 "
	    );

	    List<Object> params = new ArrayList<>();

	    if (userId != null) {
	        sql.append("AND o.user_id = ? ");
	        params.add(userId);
	    }

	    if (startDate != null) {
	        sql.append("AND o.created_at >= ? ");
	        params.add(Timestamp.valueOf(startDate));
	    }

	    if (endDate != null) {
	        sql.append("AND o.created_at <= ? ");
	        params.add(Timestamp.valueOf(endDate));
	    }

	    if (minAmount != null) {
	        sql.append("AND o.final_amount >= ? ");
	        params.add(minAmount);
	    }

	    if (maxAmount != null) {
	        sql.append("AND o.final_amount <= ? ");
	        params.add(maxAmount);
	    }

	    if (status != null && !status.equalsIgnoreCase("all")) {
	        sql.append("AND o.order_status = ? ");
	        params.add(status);
	    }

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql.toString())) {

	        for (int i = 0; i < params.size(); i++) {
	            ps.setObject(i + 1, params.get(i));
	        }

	        ResultSet rs = ps.executeQuery();

	        if (rs.next()) {
	            return rs.getInt(1);
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return 0;
	}


	@Override
	public Order Update(Order item) {
		String sql = """
                UPDATE orders SET
                    payment_status = ?,
                    order_status = ?,
                    tracking_number = ?,
                    cancelled_reason = ?,
                    cancelled_at = ?,
                    delivered_at = ?,
                    updated_at = ?
                WHERE id = ?
                """;

        try (Connection conn = dbConnection.getConn();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, item.getPaymentStatus());
            ps.setString(2, item.getOrderStatus());
            ps.setString(3, item.getTrackingNumber());
            ps.setString(4, item.getCancelledReason());

            if (item.getCancelledAt() != null)
                ps.setTimestamp(5, Timestamp.valueOf(item.getCancelledAt()));
            else
                ps.setNull(5, Types.TIMESTAMP);

            if (item.getDeliveredAt() != null)
                ps.setTimestamp(6, Timestamp.valueOf(item.getDeliveredAt()));
            else
                ps.setNull(6, Types.TIMESTAMP);

            ps.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            ps.setLong(8, item.getOrderId());

            return ps.executeUpdate() > 0 ? item : null;

        } catch (Exception e) {
            e.printStackTrace();
        }
		return null;
	}


	private Order mapResultSetToOrder(ResultSet rs) throws SQLException {
        Order order = new Order();

        order.setOrderId(rs.getLong("id"));
        order.setOrderNumber(rs.getString("order_number"));
        order.setUserId(rs.getLong("user_id"));
//        order.setShopId(rs.getLong("shop_id"));
        order.setAddressId(rs.getLong("address_id"));
        order.setTotalAmount(rs.getDouble("total_amount"));
        order.setShippingFee(rs.getDouble("shipping_fee"));
        order.setDiscountAmount(rs.getDouble("discount_amount"));
        order.setFinalAmount(rs.getDouble("final_amount"));
        order.setPaymentMethod(rs.getString("payment_method"));
        order.setPaymentStatus(rs.getString("payment_status"));
        order.setOrderStatus(rs.getString("order_status"));
        order.setNote(rs.getString("note"));
        order.setVoucherId((Long) rs.getObject("voucher_id"));
        order.setTrackingNumber(rs.getString("tracking_number"));
        order.setCancelledReason(rs.getString("cancelled_reason"));

        java.sql.Timestamp cancelledAt = rs.getTimestamp("cancelled_at");
        if (cancelledAt != null)
            order.setCancelledAt(cancelledAt.toLocalDateTime());

        java.sql.Timestamp deliveredAt = rs.getTimestamp("delivered_at");
        if (deliveredAt != null)
            order.setDeliveredAt(deliveredAt.toLocalDateTime());

        order.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        order.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

        return order;
    }


	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}





	@Override
	public Order GetById(int id) {
		// TODO Auto-generated method stub
		return null;
	}





	@Override
	public List<Order> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

}











