package docker_test.com.repository;

import docker_test.com.models.Address;
import docker_test.com.configs.DBConnection;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AddressRepository implements IRepositories<Address> {
    private static AddressRepository instance;
    private final DBConnection dbConnection;

    private AddressRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static AddressRepository Instance() {
        if (instance == null) {
            instance = new AddressRepository();
        }
        return instance;
    }

    @Override
    public Address Create(Address item) throws SQLException {
        String sql = """
            INSERT INTO address
            (user_id, shop_id, recipient_name, recipient_phone, address_line,
             ward, district, city, postal_code, is_default, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (
            Connection conn = dbConnection.getConn();
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setLong(1, item.getUserId());

            if (item.getShop_id() > 0) {
                stmt.setLong(2, item.getShop_id());
            } else {
                stmt.setNull(2, Types.BIGINT);
            }

            stmt.setString(3, item.getRecipientName());
            stmt.setString(4, item.getRecipientPhone());
            stmt.setString(5, item.getAddressLine());

            if (item.getWard() != null) {
                stmt.setLong(6, item.getWard());
            } else {
                stmt.setNull(6, Types.BIGINT);
            }

            if (item.getDistrict() != null) {
                stmt.setLong(7, item.getDistrict());
            } else {
                stmt.setNull(7, Types.BIGINT);
            }

            if (item.getCity() != null) {
                stmt.setLong(8, item.getCity());
            } else {
                stmt.setNull(8, Types.BIGINT);
            }

            stmt.setString(9, item.getPostalCode());
            stmt.setInt(10, item.getIsDefault());

            LocalDateTime createdAt = item.getCreatedAt() != null ? item.getCreatedAt() : LocalDateTime.now();
            LocalDateTime updatedAt = item.getUpdatedAt() != null ? item.getUpdatedAt() : LocalDateTime.now();
            stmt.setTimestamp(11, Timestamp.valueOf(createdAt));
            stmt.setTimestamp(12, Timestamp.valueOf(updatedAt));

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        item.setAddressId(rs.getLong(1));
                    }
                }
                item.setCreatedAt(createdAt);
                item.setUpdatedAt(updatedAt);
                return item;
            }
        }

        return null;
    }

    @Override
    public Address Update(Address item) {
        // ...existing code for update...
        return null;
    }

    @Override
    public boolean Delete(int id) {
        // ...existing code for delete...
        return false;
    }

    @Override
    public Address GetById(int id) {
        // ...existing code for get by id...
        return null;
    }

    @Override
    public List<Address> GetAll() {
        // ...existing code for get all...
        return null;
    }
    public Address getByShopId(long shopId) {
		System.out.println("Finding address for shop ID: " + shopId);
		String sql = "SELECT * FROM address WHERE shop_id = ?";
		try (Connection conn = dbConnection.getConn();
			 PreparedStatement stmt = conn.prepareStatement(sql)) {
			stmt.setLong(1, shopId);
			ResultSet rs = stmt.executeQuery();
			if (rs.next()) {
				return new Address(
					rs.getLong("id"),
					rs.getLong("user_id"),
					rs.getLong("shop_id"),
					rs.getString("recipient_name"),
					rs.getString("recipient_phone"),
					rs.getString("address_line"),
					rs.getLong("ward"),
					rs.getLong("district"),
					rs.getLong("city"),
					rs.getString("postal_code"),
					rs.getInt("is_default"),
					rs.getTimestamp("created_at").toLocalDateTime(),
					rs.getTimestamp("updated_at").toLocalDateTime()
				);
			}
		} catch (SQLException e) {
			e.printStackTrace();
			}
		return null;
		}

    public List<Address> findByUserId(long userId) {
    	System.out.println("Finding addresses for user ID: " + userId);
        List<Address> addresses = new ArrayList<>();
        String sql = "SELECT * FROM address WHERE user_id = ?";
        try (Connection conn = dbConnection.getConn();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Address address = new Address(
                    rs.getLong("id"),
                    rs.getLong("user_id"),
                    rs.getLong("shop_id"),
                    rs.getString("recipient_name"),
                    rs.getString("recipient_phone"),
                    rs.getString("address_line"),
                    rs.getLong("ward"),
                    rs.getLong("district"),
                    rs.getLong("city"),
                    rs.getString("postal_code"),
                    rs.getInt("is_default"),
                    rs.getTimestamp("created_at").toLocalDateTime(),
                    rs.getTimestamp("updated_at").toLocalDateTime()
                );
                addresses.add(address);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
       
        return addresses;
    }
}
