package docker_test.com.repository;

import java.sql.SQLException;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.product.ProductImage;

public class ProductImageRepository implements IRepositories<ProductImage> {
    
	private DBConnection dbConnection;
	   private static ProductImageRepository instance = null;
	
	   public static ProductImageRepository Instance() {
		   if (instance==null) {
   			instance=new ProductImageRepository();
   		}
   		return instance;
	   }
	   public ProductImageRepository() {
   		this.dbConnection = DBConnection.getInstance();
    }
	   
	@Override
	public ProductImage Create(ProductImage item) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ProductImage Update(ProductImage item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public ProductImage GetById(Object item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ProductImage> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

}
