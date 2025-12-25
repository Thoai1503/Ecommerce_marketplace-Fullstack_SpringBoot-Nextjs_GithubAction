package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashSet;

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
	public void Create(Category item) {
		// TODO Auto-generated method stub
		
	}

	@Override 
	public void Update(Category item) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public boolean Delete(Category item) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Category GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HashSet<Category> GetAll() {
		HashSet<Category> list = new HashSet<Category>();
		String sql ="select * from categories";
		
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql);
				){
			  ResultSet rs =	ps.executeQuery();
			  
			  while (rs.next()) {
		             Category ca = new Category();
		             ca.setId(rs.getInt("id"));
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

}
