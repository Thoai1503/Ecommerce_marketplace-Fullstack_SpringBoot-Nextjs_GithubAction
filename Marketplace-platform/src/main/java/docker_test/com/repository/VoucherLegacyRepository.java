package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherLegacyMapper;
import docker_test.com.models.voucher.VoucherLegacy;

public class VoucherLegacyRepository implements IRepositories<VoucherLegacy> {

	private static VoucherLegacyRepository instance;
	private final DBConnection dbConnection;
	private final VoucherLegacyMapper mapper;

	public VoucherLegacyRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherLegacyMapper();
	}

	public static synchronized VoucherLegacyRepository Instance() {
		if (instance == null) {
			instance = new VoucherLegacyRepository();
		}
		return instance;
	}

	@Override
	public VoucherLegacy Create(VoucherLegacy v) throws SQLException {
		String sql = """
				INSERT INTO voucher_legacy (
					id, shop_id, voucher_code, voucher_name, description,
					discount_type, discount_value, min_order_value, max_discount,
					usage_limit, used_count, start_date, end_date, is_active, created_at
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, v.getId());
			ps.setObject(2, v.getShopId());
			ps.setString(3, v.getVoucherCode());
			ps.setString(4, v.getVoucherName());
			ps.setString(5, v.getDescription());
			ps.setString(6, v.getDiscountType());
			ps.setObject(7, v.getDiscountValue(), Types.DECIMAL);
			ps.setObject(8, v.getMinOrderValue(), Types.DECIMAL);
			ps.setObject(9, v.getMaxDiscount(), Types.DECIMAL);
			ps.setObject(10, v.getUsageLimit());
			ps.setObject(11, v.getUsedCount());
			ps.setObject(12, v.getStartDate());
			ps.setObject(13, v.getEndDate());
			ps.setInt(14, Boolean.TRUE.equals(v.getIsActive()) ? 1 : 0);

			ps.executeUpdate();
			return v;
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Create voucher legacy failed: " + e.getMessage(), e);
		}
	}

	@Override
	public VoucherLegacy Update(VoucherLegacy v) {
		String sql = """
				UPDATE voucher_legacy SET
					shop_id = ?,
					voucher_code = ?,
					voucher_name = ?,
					description = ?,
					discount_type = ?,
					discount_value = ?,
					min_order_value = ?,
					max_discount = ?,
					usage_limit = ?,
					used_count = ?,
					start_date = ?,
					end_date = ?,
					is_active = ?
				WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, v.getShopId());
			ps.setString(2, v.getVoucherCode());
			ps.setString(3, v.getVoucherName());
			ps.setString(4, v.getDescription());
			ps.setString(5, v.getDiscountType());
			ps.setObject(6, v.getDiscountValue(), Types.DECIMAL);
			ps.setObject(7, v.getMinOrderValue(), Types.DECIMAL);
			ps.setObject(8, v.getMaxDiscount(), Types.DECIMAL);
			ps.setObject(9, v.getUsageLimit());
			ps.setObject(10, v.getUsedCount());
			ps.setObject(11, v.getStartDate());
			ps.setObject(12, v.getEndDate());
			ps.setInt(13, Boolean.TRUE.equals(v.getIsActive()) ? 1 : 0);
			ps.setObject(14, v.getId());

			return ps.executeUpdate() > 0 ? v : null;

		} catch (Exception e) {
			throw new RuntimeException("Update voucher legacy failed", e);
		}
	}

	@Override
	public boolean Delete(int id) {
		String sql = "DELETE FROM voucher_legacy WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete voucher legacy failed", e);
		}
	}

	@Override
	public VoucherLegacy GetById(int id) {
		String sql = "SELECT * FROM voucher_legacy WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);

			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					return mapper.RowMap(rs);
				}
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher legacy by id failed", e);
		}

		return null;
	}

	@Override
	public List<VoucherLegacy> GetAll() {
		String sql = "SELECT * FROM voucher_legacy ORDER BY created_at DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get all voucher legacy failed", e);
		}
	}

	public VoucherLegacy getByCode(String code) {
		String sql = "SELECT * FROM voucher_legacy WHERE voucher_code = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, code);

			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					return mapper.RowMap(rs);
				}
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher legacy by code failed", e);
		}

		return null;
	}

	public List<VoucherLegacy> getByShopId(Long shopId) {
		String sql = "SELECT * FROM voucher_legacy WHERE shop_id = ? ORDER BY created_at DESC";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, shopId);

			try (ResultSet rs = ps.executeQuery()) {
				return mapper.RowsMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher legacy by shop id failed", e);
		}
	}
}