package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;

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
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Unit Update(Unit item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean Delete(Unit item) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Unit GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HashSet<Unit> GetAll() {
		HashSet<Unit> list = new HashSet<Unit>();
		String sql ="select * from unit";
		
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				){
			  ResultSet rs =	ps.executeQuery();
			  
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
