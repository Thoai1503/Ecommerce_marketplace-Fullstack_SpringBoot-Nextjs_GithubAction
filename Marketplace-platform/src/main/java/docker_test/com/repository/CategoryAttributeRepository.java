package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.CategoryAttribute;
import docker_test.com.models.attribute.Attribute;

public class CategoryAttributeRepository implements IRepositories<CategoryAttribute> {

	private static CategoryAttributeRepository instance=null;
	private DBConnection dbConnection;
	
	 public CategoryAttributeRepository() {
		this.dbConnection= DBConnection.getInstance();
	}
	public static CategoryAttributeRepository Instance() {
		if (instance==null) {
			instance=new CategoryAttributeRepository();
		}
		return instance;
	}
	
	@Override
	public CategoryAttribute Create(CategoryAttribute item) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public CategoryAttribute Update(CategoryAttribute item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean Delete(CategoryAttribute item) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public CategoryAttribute GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HashSet<CategoryAttribute> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

	public HashSet<CategoryAttribute> GetByCategoryId(int category_id) {
	     String sql =  "SELECT *  FROM attributes a inner join category_attributes ca on ca.attribute_id = a.id where category_id = ? ";
	     HashSet<CategoryAttribute> list = new HashSet<>();
	     try(Connection con = dbConnection.getConn();
	    		 PreparedStatement ps = con.prepareStatement(sql);
	    		 ){
	    	 
	    	 ps.setInt(1, category_id);
	    	 
	    	 
	    	 ResultSet rs = ps.executeQuery();
	    	 
	    	 while (rs.next()) {
	    		 	CategoryAttribute ca = new CategoryAttribute();
	    		 	ca.setAttributeId(category_id);
	    		 	ca.setCategoryId(rs.getInt("category_id"));
	    		 	Attribute a = new Attribute();
	    		 	a.setName(rs.getString("name"));
	    			a.setSlug(rs.getString("slug"));
	    			a.setDataType(rs.getInt("data_type"));
	    			ca.setAttribute(a);
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
