package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherConditionLegacyMapper;
import docker_test.com.models.voucher.VoucherConditionLegacy;

public class VoucherConditionLegacyRepository implements IRepositories<VoucherConditionLegacy> {

	private static VoucherConditionLegacyRepository instance;
	private final DBConnection dbConnection;
	private final VoucherConditionLegacyMapper mapper;

	public VoucherConditionLegacyRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherConditionLegacyMapper();
	}

	public static synchronized VoucherConditionLegacyRepository Instance() {
		if (instance == null) {
			instance = new VoucherConditionLegacyRepository();
		}
		return instance;
	}

	@Override
	public VoucherConditionLegacy Create(VoucherConditionLegacy c) throws SQLException {

		String sql = """
					INSERT INTO voucher_condition_legacy (
						voucher_id, condition_type_id, operator,
						value_numeric, value_numeric_max, value_text, value_json,
						is_required, priority, error_message,
						created_at, updated_at
					)
					VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, NOW(), NOW())
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, c.getVoucherId());
			ps.setObject(2, c.getConditionTypeId());
			ps.setString(3, c.getOperator());
			ps.setObject(4, c.getValueNumeric());
			ps.setObject(5, c.getValueNumericMax());
			ps.setString(6, c.getValueText());
			ps.setString(7, c.getValueJson());
			ps.setInt(8, Boolean.TRUE.equals(c.getIsRequired()) ? 1 : 0);
			ps.setObject(9, c.getPriority());
			ps.setString(10, c.getErrorMessage());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				c.setId(rs.getLong(1));
			}

			return c;
		}
	}

	@Override
	public VoucherConditionLegacy Update(VoucherConditionLegacy c) {

		String sql = """
					UPDATE voucher_condition_legacy SET
						condition_type_id = ?, operator = ?,
						value_numeric = ?, value_numeric_max = ?, value_text = ?, value_json = CAST(? AS JSON),
						is_required = ?, priority = ?, error_message = ?, updated_at = NOW()
					WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, c.getConditionTypeId());
			ps.setString(2, c.getOperator());
			ps.setObject(3, c.getValueNumeric());
			ps.setObject(4, c.getValueNumericMax());
			ps.setString(5, c.getValueText());
			ps.setString(6, c.getValueJson());
			ps.setInt(7, Boolean.TRUE.equals(c.getIsRequired()) ? 1 : 0);
			ps.setObject(8, c.getPriority());
			ps.setString(9, c.getErrorMessage());
			ps.setObject(10, c.getId());

			return ps.executeUpdate() > 0 ? c : null;

		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public boolean Delete(int id) {
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement("DELETE FROM voucher_condition_legacy WHERE id=?")) {
			ps.setInt(1, id);
			return ps.executeUpdate() > 0;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public VoucherConditionLegacy GetById(int id) {
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement("SELECT * FROM voucher_condition_legacy WHERE id=?")) {
			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();
			return rs.next() ? mapper.RowMap(rs) : null;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public List<VoucherConditionLegacy> GetAll() {
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con
						.prepareStatement("SELECT * FROM voucher_condition_legacy ORDER BY priority ASC");
				ResultSet rs = ps.executeQuery()) {
			return mapper.RowsMap(rs);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}