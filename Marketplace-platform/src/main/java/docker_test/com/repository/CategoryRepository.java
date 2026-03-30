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


public class CategoryRepository implements IRepositories<Category>{

	private static CategoryRepository instance=null;
	private DBConnection dbConnection;
	
	
	public CategoryRepository () {
		this.dbConnection= DBConnection.getInstance();
	}
	public static CategoryRepository Instance() {
		if (instance==null) {
			instance=new CategoryRepository();
		}
		return instance;
	}
	
	
	@Override
	public Category Create(Category item) throws SQLException {
	String sql ="insert into category (parent_id, category_name,category_slug,level) values (?,?,?,?)";
	try(Connection con = dbConnection.getConn();
			PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)	
			){
		ps.setLong(1, item.getParent_id());
		ps.setString(2, item.getCategory_name());
		ps.setString(3, item.getCategory_slug());
		ps.setInt(4,item.getLevel());
		int rows = ps.executeUpdate();
		if(rows>0) {
		
			 if (rows > 0) {
		            try (ResultSet rs = ps.getGeneratedKeys()) {
		                if (rs.next()) {
		                    int id = rs.getInt(1);
		                    item.setId(id);
		                    System.out.println("ID của bản ghi mới: " + id);
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
	public Category Update(Category item) {
		// TODO Auto-generated method stub
		
		
		 return null;
	}

	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}


	@Override
	public List<Category> GetAll() {
		System.out.println("Get all category...");
		List<Category> list = new ArrayList<Category>();
		String sql ="select * from category";
		
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				){
			  ResultSet rs =	ps.executeQuery();
			  
			  while (rs.next()) {
		             Category ca = new Category();
		             ca.setId(rs.getInt("id"));
		             ca.setParent_id(rs.getInt("parent_id"));
		             ca.setCategory_name(rs.getString("category_name"));
		             ca.setCategory_slug(rs.getString("category_slug"));
		             ca.setLevel(rs.getInt("level"));
		           ca.setIs_active(rs.getInt("is_active"));
		             list.add(ca);
		      }
			  return list;
			
		}
		catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return null;
	}
	@Override
	public Category GetById(int id) {
		// TODO Auto-generated method stub
		return null;
	}

}
