package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductVariant;

public class ProductVariantRepository implements IRepositories<ProductVariant> {
	private static ProductVariantRepository instance = null;
	private DBConnection dbConnection;

	public static ProductVariantRepository Instance() {
		if (instance == null) {
			instance = new ProductVariantRepository();
		}
		return instance;
	}

	private ProductVariantRepository() {
 		this.dbConnection = DBConnection.getInstance();
	}


	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}
	public List<ProductVariant> GetByProductId(int productId) {
					List<ProductVariant> list = new ArrayList<ProductVariant>();
					String sql = "select * from product_variant where product_id =?";
					try(Connection con = dbConnection.getConn();
							PreparedStatement ps = con.prepareStatement(sql)){
						  ps.setInt(1, productId);
						  ResultSet rs = ps.executeQuery();
						  																																																																					
						  while(rs.next()) {
							  ProductVariant productVariant = new ProductVariant();
							  productVariant.setImage_url(rs.getString("image_url"));
							  productVariant.setPrice(rs.getDouble("price"));
							  productVariant.setProduct_id(rs.getInt("product_id"));
							  productVariant.setStock_quantity(rs.getInt("stock_quantity"));
							  productVariant.setVariant_name(rs.getString("variant_name"));
							 
							  list.add(productVariant);
							  
						  }
						  return list;
					}
					catch(Exception ex) {
						ex.printStackTrace();
					}
					return null;
	}

	@Override
	public ProductVariant Create(ProductVariant item) throws SQLException {
		String sql = "insert into product_variant (product_id, variant_name, sku, price, stock_quantity, image_url) values (?,?,?,?,?,?)";
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)){
			  ps.setLong(1, item.getProduct_id());
			  ps.setString(2, item.getVariant_name());
			  ps.setString(3, item.getSku());
			  ps.setDouble(4, item.getPrice());
			  ps.setInt(5, item.getStock_quantity());
			  ps.setString(6, item.getImage_url());
			  int affectedRows = ps.executeUpdate();
			  if (affectedRows > 0) {
				  try (ResultSet keys = ps.getGeneratedKeys()) {
					  if (keys.next()) {
						  item.setId(keys.getInt(1));
						  System.out.println("ID của bản ghi mới: " + item.getId());
					  }
				  }
				  return item;
			  }
		}
		catch(Exception ex) {
			ex.printStackTrace();
		}
		return  null;
	}

	@Override
	public ProductVariant Update(ProductVariant item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ProductVariant> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ProductVariant GetById(int id) {
	
		System.out.println("id: "+id);
		String sql = "select * from product_variant where id =?";
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
			  ps.setInt(1, id);
			  ResultSet rs = ps.executeQuery();
			 
			  if(rs.next()) {
				  ProductVariant productVariant = new ProductVariant();
				  productVariant.setId(rs.getInt("id"));
				  productVariant.setImage_url(rs.getString("image_url"));
				  productVariant.setPrice(rs.getDouble("price"));
				  productVariant.setProduct_id(rs.getInt("product_id"));
				  productVariant.setWeight(rs.getLong("weight"));
				  productVariant.setHeight(rs.getLong("height"));
				  productVariant.setWidth(rs.getLong("width"));
				  productVariant.setStock_quantity(rs.getInt("stock_quantity"));
				  productVariant.setVariant_name(rs.getString("variant_name"));
				 
				  return productVariant;
				  
			  }
		}
		catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return null;
	}
	
	public ProductVariant updateImage(int id, String imageUrl) {
		String sql = "update product_variant set image_url = ? where id = ?";
		try(Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
			  ps.setString(1, imageUrl);
			  ps.setInt(2, id);
			  int affectedRows = ps.executeUpdate();
			  if (affectedRows > 0) {
				  return GetById(id);
			  }
		}
		catch(Exception ex) {
			ex.printStackTrace();
		}
		return null;
	}

}
