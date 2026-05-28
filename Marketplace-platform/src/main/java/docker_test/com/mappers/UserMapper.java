package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.models.User;
import docker_test.com.utils.StringValue;

public final class UserMapper implements IMapper<User> {

    @Override
    public User RowMap(ResultSet rs) {
        User user = new User();
        try {
        	Object idVal = rs.getObject("id");
        	user.setId(idVal != null ? ((Number) idVal).longValue() : null);
            user.setEmail(rs.getString(StringValue.USER_EMAIL_COL));
            user.setPhone(rs.getString(StringValue.USER_PHONE_COL));
          //  user.setPasswordHash(rs.getString(StringValue.USER_PASSWORD_COL));
            
            if (rs.getString(StringValue.USER_PASSWORD_COL) != null) {
				user.setPasswordHash(rs.getString(StringValue.USER_PASSWORD_COL));
			}
            
            
            user.setFullName(rs.getString(StringValue.USER_FULLNAME_COL));
            user.setAvatarUrl(rs.getString(StringValue.USER_AVATAR_COL));

            // DATE → LocalDate
            if (rs.getDate(StringValue.USER_DOB_COL) != null) {
                user.setDateOfBirth(
                    rs.getDate(StringValue.USER_DOB_COL).toLocalDate()
                );
            }
            //user.setGender(rs.getString(StringValue.USER_GENDER_COL));
            if (rs.getString(StringValue.USER_GENDER_COL) != null) {
				user.setGender(rs.getString(StringValue.USER_GENDER_COL));
            }
         //   user.setUserType(rs.getString(StringValue.USER_TYPE_COL));

            
            if (rs.getString(StringValue.USER_TYPE_COL) != null) {
            					user.setUserType(rs.getString(StringValue.USER_TYPE_COL));
            }
            
            // TINYINT(1) → boolean
       //     user.setIsVerified(rs.getInt(StringValue.USER_VERIFIED_COL));
            
            if (rs.getObject(StringValue.USER_VERIFIED_COL) != null) {
				user.setIsVerified(rs.getInt(StringValue.USER_VERIFIED_COL));
			}
            
            //user.setIsActive(rs.getInt(StringValue.USER_ACTIVE_COL));

            if (rs.getObject(StringValue.USER_ACTIVE_COL) != null) {
            					user.setIsActive(rs.getInt(StringValue.USER_ACTIVE_COL));
            }
            
            // TIMESTAMP → LocalDateTime
            Timestamp createdAt = rs.getTimestamp(StringValue.USER_CREATED_AT_COL);
            if (createdAt != null) {
                user.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp(StringValue.USER_UPDATED_AT_COL);
            if (updatedAt != null) {
                user.setUpdatedAt(updatedAt.toLocalDateTime());
            }

            Timestamp lastLogin = rs.getTimestamp(StringValue.USER_LAST_LOGIN_COL);
            if (lastLogin != null) {
                user.setLastLogin(lastLogin.toLocalDateTime());
            }

            try {
                Object totalOrders = rs.getObject("total_orders");
                if (totalOrders != null) {
                    user.setTotalOrders(((Number) totalOrders).intValue());
                }
            } catch (SQLException ignored) {
            }

            try {
                Object totalSpent = rs.getObject("total_spent");
                if (totalSpent != null) {
                    user.setTotalSpent(((Number) totalSpent).doubleValue());
                }
            } catch (SQLException ignored) {
            }

            try {
                Timestamp lastOrderDate = rs.getTimestamp("last_order_date");
                if (lastOrderDate != null) {
                    user.setLastOrderDate(lastOrderDate.toLocalDateTime());
                }
            } catch (SQLException ignored) {
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return user;
    }

    @Override
    public List<User> RowsMap(ResultSet rs) {
        List<User> users = new ArrayList<>();
        try {
            while (rs.next()) {
                User user = RowMap(rs);
                users.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

	@Override
	public User mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}
