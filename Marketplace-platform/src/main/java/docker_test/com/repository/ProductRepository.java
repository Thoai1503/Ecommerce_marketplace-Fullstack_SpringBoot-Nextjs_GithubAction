package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.factory.RepoFactoryImpl;
//import docker_test.com.jdbc.JDBC;
import docker_test.com.mappers.product.ProductMapper;
import docker_test.com.models.Category;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductImage;



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
		 String sql = "insert into product (shop_id,category_id,description,product_name,product_slug,price,original_price) values (?,?,?,?,?,?,?)";
		 try (Connection con = dbConnection.getConn();
					PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)){
			 ps.setLong(1, item.getShop_id());
			 ps.setLong(2, item.getCategory_id());
			 ps.setString(3, item.getDescription());
		
			 ps.setString(4, item.getProduct_name());
			 ps.setString(5, item.getProduct_slug());
			 ps.setDouble(6, item.getPrice());
			 ps.setDouble(7, item.getOriginal_price());
			 
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
	public Product GetById(int id) {
		String sql = "SELECT \r\n"
				+ "    p.*,\r\n"
				+ "    pi.image_url\r\n"
				+ "FROM product p\r\n"
				+ "LEFT JOIN product_image pi ON p.id = pi.product_id \r\n"
				+ "    AND pi.id = (\r\n"
				+ "        SELECT MIN(id) \r\n"
				+ "        FROM product_image \r\n"
				+ "        WHERE product_id = p.id\r\n"
				
				+ "    )"
				
				+ " WHERE p.id = ?"
				;
		System.out.print("GetAll..");
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
	
			  ps.setInt(1, id);
			  ResultSet rs =	ps.executeQuery();
			  while (rs.next()) {
		          Product image = new Product();
		          image.setId(rs.getInt("id"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setCategory_id(1);
		          image.setShop_id(0);
		          image.setPrice(rs.getDouble("price"));
		          image.setOriginal_price(rs.getDouble("original_price"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setImage_url(rs.getString("image_url"));
		          image.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
		      	   return image;
		      }
		

		}
		catch (Exception ex) {
			ex.printStackTrace();;
		}
		return null;
	}

	@Override
	public List<Product> GetAll() {
		List<Product> list = new ArrayList<Product>();
		String sql = "SELECT \r\n"
				+ "    p.*,\r\n"
				+ "    pi.image_url\r\n"
				+ "FROM product p\r\n"
				+ "LEFT JOIN product_image pi ON p.id = pi.product_id \r\n"
				+ "    AND pi.id = (\r\n"
				+ "        SELECT MIN(id) \r\n"
				+ "        FROM product_image \r\n"
				+ "        WHERE product_id = p.id\r\n"
				+ "    )";
		System.out.print("GetAll..");
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
	
			  ResultSet rs =	ps.executeQuery();
			  while (rs.next()) {
		          Product image = new Product();
		          image.setId(rs.getInt("id"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setCategory_id(1);
		          image.setShop_id(0);
		          image.setPrice(rs.getDouble("price"));
		          image.setOriginal_price(rs.getDouble("original_price"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setImage_url(rs.getString("image_url"));
		          image.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
		             list.add(image);
		      }
			  return list;
			

		}
		catch (Exception ex) {
			ex.printStackTrace();;
		}
		return null;
	}
     
	
	public List<Product> GetByShopId(int shop_id) {
		List<Product> list = new ArrayList<Product>();
		String sql = "select *,p.id as product_id from product p join shop s on p.shop_id =s.id join user u on u.id = s.user_id left join product_image pi on  p.id = pi.product_id and pi.id = (select MIN(id) from product_image where product_id =p.id) where s.id = ?";

		System.out.print("GetAll..");
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
			  ps.setInt(1, shop_id);
	
			  ResultSet rs =	ps.executeQuery();
			  while (rs.next()) {
		          Product image = new Product();
		          image.setId(rs.getInt("product_id"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setCategory_id(rs.getInt("category_id"));
		          image.setShop_id(rs.getInt("shop_id"));
		          image.setPrice(rs.getDouble("price"));
		          image.setOriginal_price(rs.getDouble("original_price"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setImage_url(rs.getString("image_url"));
		          image.setCreated_at(rs.getTimestamp("created_at").toLocalDateTime());
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
