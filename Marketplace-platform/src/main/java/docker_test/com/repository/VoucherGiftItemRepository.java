package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherGiftItemMapper;
import docker_test.com.models.voucher.VoucherGiftItem;

public class VoucherGiftItemRepository implements IRepositories<VoucherGiftItem> {

	private static VoucherGiftItemRepository instance;
	private final DBConnection dbConnection;
	private final VoucherGiftItemMapper mapper;

	public VoucherGiftItemRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherGiftItemMapper();
	}

	public static synchronized VoucherGiftItemRepository Instance() {
		if (instance == null) {
			instance = new VoucherGiftItemRepository();
		}
		return instance;
	}

	@Override
	public VoucherGiftItem Create(VoucherGiftItem v) throws SQLException {

		String sql = """
					INSERT INTO voucher_gift_item (
						voucher_id, product_id, variant_id, quantity
					)
					VALUES (?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, v.getVoucherId());
			ps.setObject(2, v.getProductId());
			ps.setObject(3, v.getVariantId());
			ps.setObject(4, v.getQuantity());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				v.setId(rs.getLong(1));
			}

			return v;
		}
	}

	@Override
	public VoucherGiftItem Update(VoucherGiftItem v) {

		String sql = """
					UPDATE voucher_gift_item SET
						voucher_id = ?, product_id = ?, variant_id = ?, quantity = ?
					WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, v.getVoucherId());
			ps.setObject(2, v.getProductId());
			ps.setObject(3, v.getVariantId());
			ps.setObject(4, v.getQuantity());
			ps.setObject(5, v.getId());

			return ps.executeUpdate() > 0 ? v : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public boolean Delete(int id) {

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement("DELETE FROM voucher_gift_item WHERE id=?")) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public VoucherGiftItem GetById(int id) {

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement("SELECT * FROM voucher_gift_item WHERE id=?")) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			return rs.next() ? mapper.RowMap(rs) : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public List<VoucherGiftItem> GetAll() {

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement("SELECT * FROM voucher_gift_item");
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public List<VoucherGiftItem> getByVoucherId(Long voucherId) {

		String sql = "SELECT * FROM voucher_gift_item WHERE voucher_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, voucherId);
			return mapper.RowsMap(ps.executeQuery());

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public boolean deleteByVoucherId(Long voucherId) {

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement("DELETE FROM voucher_gift_item WHERE voucher_id=?")) {

			ps.setObject(1, voucherId);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}