package docker_test.com.repository;

import java.sql.SQLException;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import docker_test.com.factory.RepoFactoryImpl;
//import docker_test.com.jdbc.JDBC;
import docker_test.com.mappers.product.ProductMapper;
import docker_test.com.models.Category;
import docker_test.com.models.product.Product;



//@Repository
public class ProductRepository implements IRepositories<Product> {
   
     private static ProductRepository instance = null;
     
     public static ProductRepository Instance () {
    		if (instance==null) {
    			instance=new ProductRepository();
    		}
    		return instance;
     }
  
    
  
	
	@Override
	public Product Create(Product item) throws SQLException {
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
