package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherAuditLogMapper;
import docker_test.com.models.voucher.VoucherAuditLog;

public class VoucherAuditLogRepository implements IRepositories<VoucherAuditLog> {

	private static VoucherAuditLogRepository instance;
	private final DBConnection dbConnection;
	private final VoucherAuditLogMapper mapper;

	public VoucherAuditLogRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherAuditLogMapper();
	}

	public static synchronized VoucherAuditLogRepository Instance() {
		if (instance == null) {
			instance = new VoucherAuditLogRepository();
		}
		return instance;
	}

	@Override
	public VoucherAuditLog Create(VoucherAuditLog log) throws SQLException {

		String sql = """
				INSERT INTO voucher_audit_log (
					voucher_id,
					event_type,
					actor_type,
					actor_id,
					entity_type,
					entity_id,
					old_data,
					new_data,
					note,
					created_at
				)
				VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, NOW())
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setObject(1, log.getVoucherId());
			ps.setString(2, log.getEventType());
			ps.setString(3, log.getActorType());
			ps.setObject(4, log.getActorId());
			ps.setString(5, log.getEntityType());
			ps.setObject(6, log.getEntityId());
			ps.setString(7, log.getOldData());
			ps.setString(8, log.getNewData());
			ps.setString(9, log.getNote());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				log.setId(rs.getLong(1));
			}

			return log;

		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Create voucher audit log failed: " + e.getMessage(), e);
		}
	}

	@Override
	public VoucherAuditLog Update(VoucherAuditLog log) {

		String sql = """
				UPDATE voucher_audit_log SET
					voucher_id = ?,
					event_type = ?,
					actor_type = ?,
					actor_id = ?,
					entity_type = ?,
					entity_id = ?,
					old_data = CAST(? AS JSON),
					new_data = CAST(? AS JSON),
					note = ?
				WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, log.getVoucherId());
			ps.setString(2, log.getEventType());
			ps.setString(3, log.getActorType());
			ps.setObject(4, log.getActorId());
			ps.setString(5, log.getEntityType());
			ps.setObject(6, log.getEntityId());
			ps.setString(7, log.getOldData());
			ps.setString(8, log.getNewData());
			ps.setString(9, log.getNote());
			ps.setObject(10, log.getId());

			return ps.executeUpdate() > 0 ? log : null;

		} catch (Exception e) {
			throw new RuntimeException("Update voucher audit log failed", e);
		}
	}

	@Override
	public boolean Delete(int id) {

		String sql = "DELETE FROM voucher_audit_log WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete voucher audit log failed", e);
		}
	}

	@Override
	public VoucherAuditLog GetById(int id) {

		String sql = "SELECT * FROM voucher_audit_log WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);

			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					return mapper.RowMap(rs);
				}
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher audit log by id failed", e);
		}

		return null;
	}

	@Override
	public List<VoucherAuditLog> GetAll() {

		String sql = "SELECT * FROM voucher_audit_log ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {

			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get all voucher audit logs failed", e);
		}
	}

	public List<VoucherAuditLog> getByVoucherId(Long voucherId) {

		String sql = """
				SELECT *
				FROM voucher_audit_log
				WHERE voucher_id = ?
				ORDER BY id DESC
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setObject(1, voucherId);

			try (ResultSet rs = ps.executeQuery()) {
				return mapper.RowsMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher audit logs by voucher id failed", e);
		}
	}

	public List<VoucherAuditLog> getByEventType(String eventType) {

		String sql = """
				SELECT *
				FROM voucher_audit_log
				WHERE event_type = ?
				ORDER BY id DESC
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, eventType);

			try (ResultSet rs = ps.executeQuery()) {
				return mapper.RowsMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher audit logs by event type failed", e);
		}
	}
}