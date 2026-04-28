package docker_test.com.repository;

import java.sql.*;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.mappers.voucher.VoucherCampaignMapper;
import docker_test.com.models.voucher.VoucherCampaign;

public class VoucherCampaignRepository implements IRepositories<VoucherCampaign> {

	private static VoucherCampaignRepository instance;
	private final DBConnection dbConnection;
	private final VoucherCampaignMapper mapper;

	public VoucherCampaignRepository() {
		this.dbConnection = DBConnection.getInstance();
		this.mapper = new VoucherCampaignMapper();
	}

	public static synchronized VoucherCampaignRepository Instance() {
		if (instance == null) {
			instance = new VoucherCampaignRepository();
		}
		return instance;
	}

	// ================= CREATE =================
	@Override
	public VoucherCampaign Create(VoucherCampaign v) throws SQLException {

		String sql = """
					INSERT INTO voucher_campaign (
						code, name, description,
						start_at, end_at,
						status,
						created_by,
						create_at, update_at
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				""";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

			ps.setString(1, v.getCode());
			ps.setString(2, v.getName());
			ps.setString(3, v.getDescription());

			ps.setObject(4, v.getStart_at());
			ps.setObject(5, v.getEnd_at());

			ps.setString(6, v.getStatus());

			ps.setObject(7, v.getCreated_by());

			ps.setObject(8, v.getCreated_at());
			ps.setObject(9, v.getUpdated_at());

			ps.executeUpdate();

			ResultSet rs = ps.getGeneratedKeys();
			if (rs.next()) {
				v.setId(rs.getInt(1));
			}

			return v;
		}
	}

	// ================= UPDATE =================
	@Override
	public VoucherCampaign Update(VoucherCampaign v) {

		String sql = """
					UPDATE voucher_campaign SET
						code = ?, name = ?, description = ?,
						start_at = ?, end_at = ?,
						status = ?,
						created_by = ?,
						create_at = ?,
						update_at = NOW()
					WHERE id = ?
				""";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, v.getCode());
			ps.setString(2, v.getName());
			ps.setString(3, v.getDescription());

			ps.setObject(4, v.getStart_at());
			ps.setObject(5, v.getEnd_at());

			ps.setString(6, v.getStatus());

			ps.setObject(7, v.getCreated_by());
			ps.setObject(8, v.getCreated_at());

			ps.setInt(9, v.getId());

			return ps.executeUpdate() > 0 ? v : null;

		} catch (Exception e) {
			throw new RuntimeException("Update voucher campaign failed", e);
		}
	}

	// ================= DELETE =================
	@Override
	public boolean Delete(int id) {

		String sql = "DELETE FROM voucher_campaign WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			return ps.executeUpdate() > 0;

		} catch (Exception e) {
			throw new RuntimeException("Delete voucher campaign failed", e);
		}
	}

	// ================= GET BY ID =================
	@Override
	public VoucherCampaign GetById(int id) {

		String sql = "SELECT * FROM voucher_campaign WHERE id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get voucher campaign by id failed", e);
		}
		return null;
	}

	// ================= GET ALL =================
	@Override
	public List<VoucherCampaign> GetAll() {

		String sql = "SELECT * FROM voucher_campaign ORDER BY id DESC";

		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			System.out.println("DB = " + con.getCatalog());
			return mapper.RowsMap(rs);

		} catch (Exception e) {
			throw new RuntimeException("Get all voucher campaigns failed", e);
		}
	}

	// ================= GET BY CODE =================
	public VoucherCampaign getByCode(String code) {

		String sql = "SELECT * FROM voucher_campaign WHERE code = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setString(1, code);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return mapper.RowMap(rs);
			}

		} catch (Exception e) {
			throw new RuntimeException("Get campaign by code failed", e);
		}
		return null;
	}
}