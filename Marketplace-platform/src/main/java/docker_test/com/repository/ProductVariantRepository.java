package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
		String sql = "UPDATE product_variant SET is_active = 0 WHERE id = ?";
		try (Connection con = dbConnection.getConn();
			 PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, id);
			return ps.executeUpdate() > 0;
		} catch (Exception ex) {
			ex.printStackTrace();
		}
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
				PreparedStatement ps = con.prepareStatement(sql)){
			  ps.setLong(1, item.getProduct_id());
			  ps.setString(2, item.getVariant_name());
			  ps.setString(3, item.getSku());
			  ps.setDouble(4, item.getPrice());
			  ps.setInt(5, item.getStock_quantity());
			  ps.setString(6, item.getImage_url());
			  int affectedRows = ps.executeUpdate();
			  if (affectedRows > 0) {
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
		String sql = """
			UPDATE product_variant SET
				variant_name = COALESCE(?, variant_name),
				sku          = COALESCE(?, sku),
				price        = COALESCE(?, price),
				stock_quantity = COALESCE(?, stock_quantity),
				image_url    = COALESCE(?, image_url),
				is_active    = COALESCE(?, is_active)
			WHERE id = ?
		""";
		try (Connection con = dbConnection.getConn();
			 PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setString(1, item.getVariant_name());
			ps.setString(2, item.getSku());
			ps.setObject(3, item.getPrice());
			ps.setObject(4, item.getStock_quantity());
			ps.setString(5, item.getImage_url());
			ps.setObject(6, item.isActive());
			ps.setInt(7, item.getId());
			int rows = ps.executeUpdate();
			if (rows > 0) return GetById(item.getId());
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return null;
	}

	@Override
	public List<ProductVariant> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ProductVariant GetById(int id) {
		String sql = "SELECT * FROM product_variant WHERE id = ?";
		try (Connection con = dbConnection.getConn();
			 PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				ProductVariant v = new ProductVariant();
				v.setVariant_id(rs.getInt("id"));
				v.setProduct_id(rs.getInt("product_id"));
				v.setVariant_name(rs.getString("variant_name"));
				v.setSku(rs.getString("sku"));
				v.setPrice(rs.getDouble("price"));
				v.setStock_quantity(rs.getInt("stock_quantity"));
				v.setImage_url(rs.getString("image_url"));
				v.setActive(rs.getInt("is_active"));
				return v;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return null;
	}

}
