package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
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
		 String sql = "insert into product_image (product_id,image_url) values (?,?)";
		 try (Connection con = dbConnection.getConn();
			PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)	){
			 ps.setInt(1, item.getProductId());
			 ps.setString(2, item.getImageUrl());
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
		 catch (Exception ex) {
			 throw ex;
			 
		 }
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
