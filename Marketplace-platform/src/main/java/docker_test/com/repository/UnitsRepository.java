package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashSet;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Category;
import docker_test.com.models.Units;

public class UnitsRepository implements IRepositories<Units> {

	
	private static UnitsRepository instance=null;
	private DBConnection dbConnection;
	
	
	public UnitsRepository () {
		this.dbConnection= DBConnection.getInstance();
	}
	public static UnitsRepository Instance() {
		if (instance==null) {
			instance=new UnitsRepository();
		}
		return instance;
	}
	
	
	@Override
	public Units Create(Units item) throws SQLException {
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
	public Units Update(Units item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean Delete(Units item) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Units GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HashSet<Units> GetAll() {
		HashSet<Units> list = new HashSet<Units>();
		String sql ="select * from unit";
		
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				){
			  ResultSet rs =	ps.executeQuery();
			  
			  while (rs.next()) {
		             Units ca = new Units();
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
