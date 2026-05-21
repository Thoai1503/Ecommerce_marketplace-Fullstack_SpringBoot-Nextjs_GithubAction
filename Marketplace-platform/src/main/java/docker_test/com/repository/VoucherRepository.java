package docker_test.com.repository;

import java.sql.*;
import java.util.Collections;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherMapper;
import docker_test.com.models.voucher.Voucher;

public class VoucherRepository implements IRepositories<Voucher> {

	private static VoucherRepository instance;
	private final DBConnection dbConnection;
	private final VoucherMapper mapper;

	public VoucherRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherMapper();
	}

	public static synchronized VoucherRepository Instance() {
		if (instance == null) {
			instance = new VoucherRepository();
		}
		return instance;
	}

	// ================= CREATE =================
	@Override
	public Voucher Create(Voucher v) throws SQLException {

		String sql = """
				    INSERT INTO voucher (
				        campaign_id,
				        code, title, description,
				        issuer_type, issuer_id,
				        discount_type, discount_percent, discount_amount, max_discount_amount,
				        min_order_value, max_order_value,
				        total_quota, claimed_count, redeemed_count, per_user_quota,
				        stackable,
				        claim_start_at, claim_end_at,
				        valid_from, valid_to,
				        status, priority,
				        created_by, created_at, updated_at
				    )
				    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, v.getCampaignId());

			ps.setString(2, v.getCode());
			ps.setString(3, v.getTitle());
			ps.setString(4, v.getDescription());

			ps.setString(5, v.getIssuerType());
			ps.setObject(6, v.getIssuerId());

			ps.setString(7, v.getDiscountType());
			ps.setObject(8, v.getDiscountPercent(), Types.DECIMAL);
			ps.setObject(9, v.getDiscountAmount(), Types.DECIMAL);
			ps.setObject(10, v.getMaxDiscountAmount(), Types.DECIMAL);

			ps.setBigDecimal(11, v.getMinOrderValue());
			ps.setBigDecimal(12, v.getMaxOrderValue());

			ps.setObject(13, v.getTotalQuota());
			ps.setObject(14, v.getClaimedCount());
			ps.setObject(15, v.getRedeemedCount());
			ps.setObject(16, v.getPerUserQuota());

			ps.setInt(17, Boolean.TRUE.equals(v.getStackable()) ? 1 : 0);

			ps.setObject(18, v.getClaimStartAt());
			ps.setObject(19, v.getClaimEndAt());

			ps.setObject(20, v.getValidFrom());
			ps.setObject(21, v.getValidTo());

			ps.setString(22, v.getStatus());
			ps.setObject(23, v.getPriority());

			ps.setObject(24, v.getCreatedBy());
			ps.setTimestamp(25, new Timestamp(System.currentTimeMillis()));
			ps.setTimestamp(26, new Timestamp(System.currentTimeMillis()));

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				v.setId(rs.getLong(1));
			}

			return v;

		} catch (Exception e) { // ✅ đúng chỗ
			e.printStackTrace(); // 🔥 in lỗi thật
			throw new RuntimeException("Create voucher failed: " + e.getMessage(), e);
		}
	}

	// ================= UPDATE =================
	@Override
	public Voucher Update(Voucher v) {

		String sql = """
					UPDATE voucher SET
					 	code = ?, title = ?, description = ?,
						issuer_type = ?, issuer_id = ?,
						discount_type = ?, discount_percent = ?, discount_amount = ?, max_discount_amount = ?,
						min_order_value = ?, max_order_value = ?,
						total_quota = ?, per_user_quota = ?,
						stackable = ?,
						claim_start_at = ?, claim_end_at = ?,
						valid_from = ?, valid_to = ?,
						status = ?, priority = ?,
						updated_at = NOW()
					WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, v.getCode());
			ps.setString(2, v.getTitle());
			ps.setString(3, v.getDescription());

			ps.setString(4, v.getIssuerType());
			ps.setObject(5, v.getIssuerId());

			ps.setString(6, v.getDiscountType());
			ps.setObject(7, v.getDiscountPercent(), Types.DECIMAL);
			ps.setObject(8, v.getDiscountAmount(), Types.DECIMAL);
			ps.setObject(9, v.getMaxDiscountAmount(), Types.DECIMAL);

			ps.setBigDecimal(10, v.getMinOrderValue());
			ps.setBigDecimal(11, v.getMaxOrderValue());

			ps.setObject(12, v.getTotalQuota());
			ps.setObject(13, v.getPerUserQuota());

			ps.setInt(14, Boolean.TRUE.equals(v.getStackable()) ? 1 : 0);

			ps.setObject(15, v.getClaimStartAt());
			ps.setObject(16, v.getClaimEndAt());

			ps.setObject(17, v.getValidFrom());
			ps.setObject(18, v.getValidTo());

			ps.setString(19, v.getStatus());
			ps.setObject(20, v.getPriority());

			ps.setObject(21, v.getId());

			return ps.executeUpdate() > 0 ? v : null;

		} catch (Exception e) {
			throw new RuntimeException("Update voucher failed", e);
		}
	}

	// ================= DELETE =================
	@Override
	public boolean Delete(int id) {

		String sql = "DELETE FROM voucher WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete voucher failed", e);
		}
	}

	// ================= GET BY ID =================
	@Override
	public Voucher GetById(int id) {

		String sql = "SELECT * FROM voucher WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher by id failed", e);
		}
		return null;
	}

	// ================= GET ALL =================
	@Override
	public List<Voucher> GetAll() {

		String sql = "SELECT * FROM voucher ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get all vouchers failed", e);
		}
	}

	// ================= GET BY CODE =================
	public Voucher getByCode(String code) {

		String sql = "SELECT * FROM voucher WHERE code = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, code);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher by code failed", e);
		}
		return null;
	}
	
	public List<Voucher> getBySetOfIds(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return List.of();
		}

		//String placeholders = String.join(",", ids.stream().map(id -> "?").toArray(String[]::new));
		String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));
		String sql = "SELECT v.id,v.code, v.issuer_type,v.discount_type,v.discount_percent,v.discount_amount,v.min_order_value FROM voucher v WHERE id IN (" + placeholders + ")";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			for (int i = 0; i < ids.size(); i++) {
				ps.setLong(i + 1, ids.get(i));
			}

			ResultSet rs = ps.executeQuery();
			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get vouchers by set of ids failed", e);
		}
	}
 	
}