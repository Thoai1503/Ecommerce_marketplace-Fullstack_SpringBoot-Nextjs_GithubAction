package docker_test.com.mappers.voucher;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.voucher.VoucherGiftItem;

public final class VoucherGiftItemMapper implements IMapper<VoucherGiftItem> {

	@Override
	public VoucherGiftItem RowMap(ResultSet rs) {
		try {
			return mapRow(rs, 0);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public VoucherGiftItem mapRow(ResultSet rs, int rowNum) throws SQLException {

		VoucherGiftItem v = new VoucherGiftItem();

		v.setId(rs.getLong("id"));
		v.setVoucherId(getLong(rs, "voucher_id"));
		v.setProductId(getLong(rs, "product_id"));
		v.setVariantId(getLong(rs, "variant_id"));
		v.setQuantity(getInteger(rs, "quantity"));

		return v;
	}

	@Override
	public List<VoucherGiftItem> RowsMap(ResultSet rs) {
		List<VoucherGiftItem> list = new ArrayList<>();
		try {
			int i = 0;
			while (rs.next()) {
				list.add(mapRow(rs, i++));
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return list;
	}

	private Long getLong(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).longValue() : null;
	}

	private Integer getInteger(ResultSet rs, String col) throws SQLException {
		Object val = rs.getObject(col);
		return val != null ? ((Number) val).intValue() : null;
	}
}