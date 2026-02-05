package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Category;
import docker_test.com.models.Unit;

public class UnitRepository implements IRepositories<Unit> {

	
	private static UnitRepository instance=null;
	private DBConnection dbConnection;
	
	
	public UnitRepository () {
		this.dbConnection= DBConnection.getInstance();
	}
	public static UnitRepository Instance() {
		if (instance==null) {
			instance=new UnitRepository();
		}
		return instance;
	}
	
	
	@Override
	public Unit Create(Unit item) throws SQLException {
		String sql ="insert into unit (label, symbol) values (?,?)";
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)	
				){
			ps.setString(1, item.getLabel());
			ps.setString(2, item.getSymbol());
			int rows = ps.executeUpdate();
			if(rows>0) {
			
				 if (rows > 0) {
			            try (ResultSet rs = ps.getGeneratedKeys()) {
			                if (rs.next()) {
			                    int id = rs.getInt(1);
			                    item.setId(id);
			                    System.out.println("Unit có bản ghi mới: " + id);
			                }
			            }
			            return item;
			        }
			}
				
			
		}
		catch(Exception ex) {
			throw ex;
		}
		
			 return null;
	}

	@Override
	public Unit Update(Unit item) {
	    String sql = "UPDATE unit SET label = ?, symbol = ?, status = ? WHERE id = ?";

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql)) {

	        ps.setString(1, item.getLabel());
	        ps.setString(2, item.getSymbol());
	        ps.setInt(3, item.getStatus());
	        ps.setInt(4, item.getId());

	        int rows = ps.executeUpdate();
	        if (rows > 0) {
	            System.out.println("Update Unit thành công: " + item.getId());
	            return item;
	        }
	    } catch (Exception ex) {
	        ex.printStackTrace();
	    }
	    return null;
	}


	@Override
	public boolean Delete(int id) {
	    String sql = "UPDATE unit SET status = 0 WHERE id = ?";

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql)) {

	        ps.setInt(1, id);
	        int rows = ps.executeUpdate();

	        if (rows > 0) {
	            System.out.println("Soft delete Unit: " + id);
	            return true;
	        }
	    } catch (Exception ex) {
	        ex.printStackTrace();
	    }
	    return false;
	}


	@Override
	public Unit GetById(int id) {
	    String sql = "SELECT * FROM unit WHERE id = ? AND status = 1";

	    try (Connection con = dbConnection.getConn();
	         PreparedStatement ps = con.prepareStatement(sql)) {

	        ps.setInt(1, (int) id);
	        ResultSet rs = ps.executeQuery();

	        if (rs.next()) {
	            return new Unit(
	                rs.getInt("id"),
	                rs.getString("label"),
	                rs.getString("symbol"),
	                rs.getInt("status")
	            );
	        }

	    } catch (Exception ex) {
	        ex.printStackTrace();
	    }
	    return null;
	}


	@Override
	public List<Unit> GetAll() {
		List<Unit> list = new ArrayList<Unit>();
		String sql ="SELECT * FROM unit WHERE status = 1";
		
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				){
			  ResultSet rs = ps.executeQuery();
			  
			  while (rs.next()) {
		             Unit ca = new Unit();
		             ca.setId(rs.getInt("id"));
		             ca.setLabel(rs.getString("label"));
		             ca.setSymbol(rs.getString("symbol"));
		             list.add(ca);
		      }
			  return list;
			
		}
		catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return null;
	}
	
}
