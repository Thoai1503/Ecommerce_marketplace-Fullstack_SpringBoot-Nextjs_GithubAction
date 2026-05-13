package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherUserSegmentRuleMapper;
import docker_test.com.models.voucher.VoucherUserSegmentRule;

public class VoucherUserSegmentRuleRepository implements IRepositories<VoucherUserSegmentRule> {

	private static VoucherUserSegmentRuleRepository instance;
	private final DBConnection dbConnection;
	private final VoucherUserSegmentRuleMapper mapper;

	public VoucherUserSegmentRuleRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherUserSegmentRuleMapper();
	}

	public static synchronized VoucherUserSegmentRuleRepository Instance() {
		if (instance == null) {
			instance = new VoucherUserSegmentRuleRepository();
		}
		return instance;
	}

	// ================= CREATE =================
	@Override
	public VoucherUserSegmentRule Create(VoucherUserSegmentRule rule) throws SQLException {

		String sql = """
				INSERT INTO voucher_user_segment_rule (
					voucher_id,
					segment_type,
					segment_value
				)
				VALUES (?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, rule.getVoucherId());
			ps.setString(2, rule.getSegmentType());
			ps.setString(3, rule.getSegmentValue());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				rule.setId(rs.getLong(1));
			}

			return rule;

		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Create segment rule failed", e);
		}
	}

	// ================= UPDATE =================
	@Override
	public VoucherUserSegmentRule Update(VoucherUserSegmentRule rule) {

		String sql = """
				UPDATE voucher_user_segment_rule SET
					voucher_id = ?,
					segment_type = ?,
					segment_value = ?
				WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, rule.getVoucherId());
			ps.setString(2, rule.getSegmentType());
			ps.setString(3, rule.getSegmentValue());
			ps.setObject(4, rule.getId());

			return ps.executeUpdate() > 0 ? rule : null;

		} catch (Exception e) {
			throw new RuntimeException("Update segment rule failed", e);
		}
	}

	// ================= DELETE =================
	@Override
	public boolean Delete(int id) {
		String sql = "DELETE FROM voucher_user_segment_rule WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete segment rule failed", e);
		}
	}

	// ================= GET BY ID =================
	@Override
	public VoucherUserSegmentRule GetById(int id) {

		String sql = "SELECT * FROM voucher_user_segment_rule WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get segment rule by id failed", e);
		}

		return null;
	}

	// ================= GET ALL =================
	@Override
	public List<VoucherUserSegmentRule> GetAll() {

		String sql = "SELECT * FROM voucher_user_segment_rule ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get all segment rules failed", e);
		}
	}

	// ================= GET BY VOUCHER =================
	public List<VoucherUserSegmentRule> getByVoucherId(Long voucherId) {

		String sql = "SELECT * FROM voucher_user_segment_rule WHERE voucher_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, voucherId);
			return mapper.RowsMap(ps.executeQuery());

		} catch (Exception e) {
			throw new RuntimeException("Get segment by voucherId failed", e);
		}
	}

	// ================= DELETE BY VOUCHER =================
	public boolean deleteByVoucherId(Long voucherId) {

		String sql = "DELETE FROM voucher_user_segment_rule WHERE voucher_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, voucherId);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete segment by voucherId failed", e);
		}
	}
}