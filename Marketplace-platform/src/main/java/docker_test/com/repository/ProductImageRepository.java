package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.Category;
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
			 ps.setInt(1, item.getProduct_id());
			 ps.setString(2, item.getImage_url());
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
	
	public List<ProductImage> GetByProductId(int id) {
		List<ProductImage> list = new ArrayList<ProductImage>();
		
		String sql ="select * from product_image where product_id = ?";
		
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
			ps.setInt(1, id);
			  ResultSet rs =	ps.executeQuery();
			  while (rs.next()) {
		          ProductImage image = new ProductImage();
		          image.setId(rs.getInt("id"));
		          image.setProductId(rs.getInt("product_id"));
		          image.setImageUrl(rs.getString("image_url"));
		          image.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
		             list.add(image);
		      }
			  return list;
			

		}
		catch (Exception ex) {
			ex.printStackTrace();;
		}
		
		return null;
	}

}
