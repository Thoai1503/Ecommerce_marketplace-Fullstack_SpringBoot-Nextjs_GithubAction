package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.factory.RepoFactoryImpl;
//import docker_test.com.jdbc.JDBC;
import docker_test.com.mappers.product.ProductMapper;
import docker_test.com.models.Category;
import docker_test.com.models.product.Product;



//@Repository
public class ProductRepository implements IRepositories<Product> {
   
	
	private DBConnection dbConnection;
     private static ProductRepository instance = null;
     
     public static ProductRepository Instance () {
    		if (instance==null) {
    			instance=new ProductRepository();
    		}
    		return instance;
     }
     public ProductRepository() {
    		this.dbConnection = DBConnection.getInstance();
     }
  
    
  
	
	@Override
	public Product Create(Product item) throws SQLException {
		 System.out.print("Body: "+item.toString());
		 String sql = "insert into product (shop_id,category_id,product_name,product_slug,price,original_price) values (?,?,?,?,?,?)";
		 try (Connection con = dbConnection.getConn();
					PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)){
			 ps.setLong(1, item.getShopId());
			 ps.setLong(2, item.getCategoryId());
			 ps.setString(3, item.getProductName());
			 ps.setString(4, item.getProductSlug());
			 ps.setDouble(5, item.getPrice());
			 ps.setDouble(6, item.getOriginalPrice());
			 
			 int rows =ps.executeUpdate();
			 
			 if (rows > 0) {
					try (ResultSet rs = ps.getGeneratedKeys()) {
						if (rs.next()) {
							var id = rs.getInt(1);
							item.setId(id);
							System.out.println("ID user mới: " + id);
						}
					}
					return item;
			 }
		 }
		 
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Product Update(Product item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Product GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<Product> GetAll() {
		String sql = "SELECT * FROM Product";
		System.out.print("GetAll..");
//		var product = jdbc.query(sql, new ProductMapper());
//		for (Product pro : product) {
//		    System.out.println("Product  ID: " + pro.getProductId() + ", Title: " + pro.getProductId());
//		}
		return null;
	}
	

}
