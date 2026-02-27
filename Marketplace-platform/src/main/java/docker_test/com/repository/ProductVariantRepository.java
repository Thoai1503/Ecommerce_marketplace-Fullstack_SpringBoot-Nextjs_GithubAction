package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.configs.DBConnection;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductVariant;

public class ProductVariantRepository implements IRepositories {
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
	public Object GetById(int id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object Create(Object entity) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public java.util.List<?> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object Update(Object item) {
		// TODO Auto-generated method stub
		return null;
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

}
