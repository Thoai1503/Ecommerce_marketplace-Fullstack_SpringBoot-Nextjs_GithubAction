package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;

import javax.swing.tree.RowMapper;

import docker_test.com.models.Address; // Giả định package
import docker_test.com.utils.StringValue;

public final class AddressMapper implements org.springframework.jdbc.core.RowMapper<Address> {


    public Address RowMap(ResultSet rs) {
        Address address = new Address();
        try {
            address.setAddressId(rs.getInt(StringValue.ADDRESS_ID_COL));
            address.setUserId(rs.getInt(StringValue.ADDRESS_USER_ID_COL));
            address.setRecipientName(rs.getString(StringValue.ADDRESS_RECIPIENT_NAME_COL));
            address.setRecipientPhone(rs.getString(StringValue.ADDRESS_RECIPIENT_PHONE_COL));
            address.setAddressLine(rs.getString(StringValue.ADDRESS_LINE_COL));
            address.setWard(rs.getString(StringValue.ADDRESS_WARD_COL));	
            address.setDistrict(rs.getString(StringValue.ADDRESS_DISTRICT_COL));
            address.setCity(rs.getString(StringValue.ADDRESS_CITY_COL));
            address.setPostalCode(rs.getString(StringValue.ADDRESS_POSTAL_CODE_COL));
            address.setDefault(rs.getInt(StringValue.ADDRESS_IS_DEFAULT_COL));

            Timestamp createdAt = rs.getTimestamp(StringValue.ADDRESS_CREATED_AT_COL);
            if (createdAt != null) address.setCreatedAt(createdAt.toLocalDateTime());
            Timestamp updatedAt = rs.getTimestamp(StringValue.ADDRESS_UPDATED_AT_COL);
            if (updatedAt != null) address.setUpdatedAt(updatedAt.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return address;
    }


    public HashSet<Address> RowsMap(ResultSet rs) {
        HashSet<Address> list = new HashSet<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

	@Override
	public Address mapRow(ResultSet rs, int rowNum) throws SQLException {
		 Address address = new Address();
	        try {
	            address.setAddressId(rs.getLong(StringValue.ADDRESS_ID_COL));
	            address.setUserId(rs.getLong(StringValue.ADDRESS_USER_ID_COL));
	            address.setRecipientName(rs.getString(StringValue.ADDRESS_RECIPIENT_NAME_COL));
	            address.setRecipientPhone(rs.getString(StringValue.ADDRESS_RECIPIENT_PHONE_COL));
	            address.setAddressLine(rs.getString(StringValue.ADDRESS_LINE_COL));
	            address.setWard(rs.getString(StringValue.ADDRESS_WARD_COL));	
	            address.setDistrict(rs.getString(StringValue.ADDRESS_DISTRICT_COL));
	            address.setCity(rs.getString(StringValue.ADDRESS_CITY_COL));
	            address.setPostalCode(rs.getString(StringValue.ADDRESS_POSTAL_CODE_COL));
	            address.setDefault(rs.getInt(StringValue.ADDRESS_IS_DEFAULT_COL));

	            Timestamp createdAt = rs.getTimestamp(StringValue.ADDRESS_CREATED_AT_COL);
	            if (createdAt != null) address.setCreatedAt(createdAt.toLocalDateTime());
	            Timestamp updatedAt = rs.getTimestamp(StringValue.ADDRESS_UPDATED_AT_COL);
	            if (updatedAt != null) address.setUpdatedAt(updatedAt.toLocalDateTime());

	        } catch (SQLException e) {
	            e.printStackTrace();
	        }
	        return address;
	}
}