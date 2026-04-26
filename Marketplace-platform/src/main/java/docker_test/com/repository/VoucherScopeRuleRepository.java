package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherScopeRuleMapper;
import docker_test.com.models.voucher.VoucherScopeRule;

public class VoucherScopeRuleRepository implements IRepositories<VoucherScopeRule> {

	private static VoucherScopeRuleRepository instance;
	private final DBConnection dbConnection;
	private final VoucherScopeRuleMapper mapper;

	public VoucherScopeRuleRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherScopeRuleMapper();
	}

	public static synchronized VoucherScopeRuleRepository Instance() {
		if (instance == null) {
			instance = new VoucherScopeRuleRepository();
		}
		return instance;
	}

	// ================= CREATE =================
	@Override
	public VoucherScopeRule Create(VoucherScopeRule rule) throws SQLException {

		String sql = """
				INSERT INTO voucher_scope_rule (
					voucher_id,
					scope_type,
					scope_id,
					include_exclude,
					created_at
				)
				VALUES (?, ?, ?, ?, NOW())
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, rule.getVoucherId());
			ps.setString(2, rule.getScopeType());
			ps.setObject(3, rule.getScopeId());
			ps.setString(4, rule.getIncludeExclude());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				rule.setId(rs.getLong(1));
			}

			return rule;

		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Create voucher scope rule failed: " + e.getMessage(), e);
		}
	}

	// ================= UPDATE =================
	@Override
	public VoucherScopeRule Update(VoucherScopeRule rule) {

		String sql = """
				UPDATE voucher_scope_rule SET
					voucher_id = ?,
					scope_type = ?,
					scope_id = ?,
					include_exclude = ?
				WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, rule.getVoucherId());
			ps.setString(2, rule.getScopeType());
			ps.setObject(3, rule.getScopeId());
			ps.setString(4, rule.getIncludeExclude());
			ps.setObject(5, rule.getId());

			return ps.executeUpdate() > 0 ? rule : null;

		} catch (Exception e) {
			throw new RuntimeException("Update voucher scope rule failed", e);
		}
	}

	// ================= DELETE =================
	@Override
	public boolean Delete(int id) {

		String sql = "DELETE FROM voucher_scope_rule WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete voucher scope rule failed", e);
		}
	}

	// ================= GET BY ID =================
	@Override
	public VoucherScopeRule GetById(int id) {

		String sql = "SELECT * FROM voucher_scope_rule WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher scope rule by id failed", e);
		}

		return null;
	}

	// ================= GET ALL =================
	@Override
	public List<VoucherScopeRule> GetAll() {

		String sql = "SELECT * FROM voucher_scope_rule ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get all voucher scope rules failed", e);
		}
	}

	// ================= GET BY VOUCHER ID =================
	public List<VoucherScopeRule> getByVoucherId(Long voucherId) {

		String sql = """
				SELECT *
				FROM voucher_scope_rule
				WHERE voucher_id = ?
				ORDER BY id ASC
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, voucherId);

			try (ResultSet rs = ps.executeQuery()) {
				return mapper.RowsMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher scope rules by voucher id failed", e);
		}
	}

	// ================= DELETE BY VOUCHER ID =================
	public boolean deleteByVoucherId(Long voucherId) {

		String sql = "DELETE FROM voucher_scope_rule WHERE voucher_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, voucherId);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete voucher scope rules by voucher id failed", e);
		}
	}
}