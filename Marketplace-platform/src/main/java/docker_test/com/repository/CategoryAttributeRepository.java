package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Predicate;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.CategoryAttribute;
import docker_test.com.models.Unit;
import docker_test.com.models.attribute.Attribute;
import docker_test.com.models.attribute.AttributeValue;

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
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public CategoryAttribute GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<CategoryAttribute> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

	public HashSet<CategoryAttribute> GetByCategoryId(int category_id) {
	     String sql =  "\r\n"
	     		+ "SELECT *  FROM attribute a  join category_attribute ca on ca.attribute_id = a.id left join attribute_value av on a.id = av.attribute_id left join unit u on u.id = av.unit_id where category_id = ?";
	     HashSet<CategoryAttribute> list = new HashSet<>();
	     try(Connection con = dbConnection.getConn();
	    		 PreparedStatement ps = con.prepareStatement(sql);
	    		 ){
	    	 
	    	 ps.setInt(1, category_id);
	    	 
	    	 
	    	 ResultSet rs = ps.executeQuery();
	    	 
	    	 while (rs.next()) {
	    		 	CategoryAttribute ca = new CategoryAttribute();
	    		 	ca.setAttribute_id(rs.getInt("attribute_id"));
	    		 	ca.setCategory_id(rs.getInt("category_id"));
	    		 	Attribute a = new Attribute();
	    		 	AttributeValue av= new AttributeValue();
	    		 	Unit u = new Unit();
	    		 	u.setLabel(rs.getString("label"));
	    		 	
	    		 	u.setSymbol(rs.getString("symbol"));
	    		 	u.setId(rs.getInt("unit_id"));
	    		 	av.setUnit(u);
	    		 	av.setUnit_id(rs.getInt("unit_id"));
	    		 	av.setAttributeId(rs.getInt("attribute_id"));
	    		 	av.setValue(rs.getString("value"));
	    		 	a.setName(rs.getString("name"));
	    			a.setSlug(rs.getString("slug"));
	    			a.setData_type(rs.getInt("data_type"));
	    			a.setAttribute_value(av);
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
