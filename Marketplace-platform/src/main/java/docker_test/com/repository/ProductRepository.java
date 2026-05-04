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
import docker_test.com.models.product.ProductVariant;
import tools.jackson.databind.ObjectMapper;



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
		String sql = """
			UPDATE product SET
				is_active = ?,
				product_name = COALESCE(?, product_name),
				description = COALESCE(?, description),
				price = COALESCE(?, price),
				original_price = COALESCE(?, original_price),
				stock_quantity = COALESCE(?, stock_quantity),
				category_id = COALESCE(?, category_id),
				reject_reason = ?,
				hidden_at = ?,
				hidden_by = ?,
				hidden_reason = ?,
				hidden_by_role = ?
			WHERE id = ?
		""";
		try (Connection con = dbConnection.getConn();
			 PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, item.getIs_active() != null ? item.getIs_active() : 2);
			ps.setString(2, item.getProduct_name());
			ps.setString(3, item.getDescription());
			ps.setObject(4, item.getPrice());
			ps.setObject(5, item.getOriginal_price());
			ps.setObject(6, item.getStock_quantity());
			ps.setObject(7, item.getCategory_id());
			ps.setString(8, item.getReject_reason());
			ps.setTimestamp(9, item.getHiddenAt() != null ? java.sql.Timestamp.valueOf(item.getHiddenAt()) : null);
			if (item.getHiddenBy() != null) ps.setLong(10, item.getHiddenBy());
			else ps.setNull(10, java.sql.Types.BIGINT);
			ps.setString(11, item.getHiddenReason());
			ps.setString(12, item.getHiddenByRole());
			ps.setInt(13, item.getId());

			int rows = ps.executeUpdate();
			if (rows > 0) return GetById(item.getId());
			System.err.println("[ProductRepository.Update] 0 rows affected for id=" + item.getId());
		} catch (Exception e) {
			throw new RuntimeException("[ProductRepository.Update] failed: " + e.getMessage(), e);
		}
		return null;
	}

	@Override
	public boolean Delete(int id) {
		String sql = "UPDATE product SET is_active = 0 WHERE id = ?";
		try (Connection con = dbConnection.getConn();
			 PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setInt(1, id);
			return ps.executeUpdate() > 0;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	@Override
	public Product GetById(int id) {
		 String sql = """
SELECT 
    p.id,
    p.shop_id,
    p.category_id,
    p.product_name,
    p.product_slug,
    p.description,
    p.price,
    p.original_price,
    p.stock_quantity,
    p.sold_count,
    p.rating,
    p.review_count,
    p.weight,
    p.length,
    p.width,
    p.height,
    p.brand_id,
    p.is_active,
    p.reject_reason,
    p.hidden_at,
    p.hidden_by,
    p.hidden_reason,
    p.hidden_by_role,
    p.created_at,
    p.updated_at,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', pi.id,
                'image_url', pi.image_url,
                'display_order', pi.display_order,
                'is_thumbnail', pi.is_thumbnail
            )
            ORDER BY pi.display_order ASC
        )
        FROM product_image pi
        WHERE pi.product_id = p.id
    ) AS images,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', pv.id,
                'product_id', pv.product_id,
                'variant_name', pv.variant_name,
                'sku', pv.sku,
                'price', pv.price,
                'stock_quantity', pv.stock_quantity,
                'image_url', pv.image_url,
                'is_active', pv.is_active
            )
        )
        FROM product_variant pv
        WHERE pv.product_id = p.id
        AND pv.is_active = 1
    ) AS variants
FROM product p
WHERE p.id = ?;
		            """;
		        
		System.out.print("Get by id..");
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){
	
			  ps.setInt(1, id);
			  ResultSet rs =	ps.executeQuery();
			  ObjectMapper mapper = new ObjectMapper();
	            
	            while (rs.next()) {
	                Product product = new Product();
	                product.setId(rs.getInt("id"));
	                product.setShop_id(rs.getInt("shop_id"));
	                product.setCategory_id(rs.getInt("category_id"));
	                product.setProduct_name(rs.getString("product_name"));
	                product.setProduct_slug(rs.getString("product_slug"));
	                product.setDescription(rs.getString("description"));
	                product.setPrice(rs.getDouble("price"));
	                product.setOriginal_price(rs.getDouble("original_price"));
	                product.setStock_quantity(rs.getInt("stock_quantity"));
	                product.setSold_count(rs.getInt("sold_count"));
	                product.setRating(rs.getDouble("rating"));
	                product.setReview_count(rs.getInt("review_count"));
	                product.setIs_active(rs.getInt("is_active"));
	                try { product.setReject_reason(rs.getString("reject_reason")); } catch (Exception ignore) { /* column may be absent pre-migration */ }
	                try {
	                    var hiddenAt = rs.getTimestamp("hidden_at");
	                    if (hiddenAt != null) product.setHiddenAt(hiddenAt.toLocalDateTime());
	                } catch (Exception ignore) {}
	                try {
	                    long hiddenBy = rs.getLong("hidden_by");
	                    if (!rs.wasNull()) product.setHiddenBy(hiddenBy);
	                } catch (Exception ignore) {}
	                try { product.setHiddenReason(rs.getString("hidden_reason")); } catch (Exception ignore) {}
	                try { product.setHiddenByRole(rs.getString("hidden_by_role")); } catch (Exception ignore) {}
	                try { product.setWeight(rs.getDouble("weight")); } catch (Exception ignore) {}
	                try { product.setLength(rs.getDouble("length")); } catch (Exception ignore) {}
	                try { product.setWidth(rs.getDouble("width")); } catch (Exception ignore) {}
	                try { product.setHeight(rs.getDouble("height")); } catch (Exception ignore) {}
	                var ts = rs.getTimestamp("created_at");
	                if (ts != null) product.setCreated_at(ts.toLocalDateTime());
	                try {
	                    var uts = rs.getTimestamp("updated_at");
	                    if (uts != null) product.setUpdated_at(uts.toLocalDateTime());
	                } catch (Exception ignore) {}
	                
	                // Lấy JSON dưới dạng String
	                String variantsJson = rs.getString("variants");
	                
	                // Parse JSON String thành List<VariantDTO>
	                if (variantsJson != null && !variantsJson.equals("[]")) {
	                    List<ProductVariant> variants = mapper.readValue(
	                        variantsJson, 
	                        mapper.getTypeFactory().constructCollectionType(
	                            List.class, ProductVariant.class
	                        )
	                    );
	                    product.setVariants(variants);
	                } else {
	                    product.setVariants(new ArrayList<>());
	                }
	                String imagesJson = rs.getString("images");
	                
	                // Parse JSON String thành List<ProductImage>
	                if (imagesJson != null && !imagesJson.equals("[]")) {
	                    List<ProductImage> images = mapper.readValue(
	                        imagesJson, 
	                        mapper.getTypeFactory().constructCollectionType(
	                            List.class, ProductImage.class
	                        )
	                    );
	                    product.setImages(images);
	                } else {
	                    product.setImages(new ArrayList<>());
	                }
	                
	                System.out.println("Product: " + product.toString());
	                return product;
	            }
	                
	              
		

		}
		catch (Exception ex) {
			ex.printStackTrace();;
		}
		return null;
	}

	@Override
	public List<Product> GetAll() {
		System.out.print("Get all..");
		List<Product> list = new ArrayList<Product>();
		String sql = """
			SELECT
			    p.id, p.shop_id, p.category_id, p.product_name, p.product_slug,
			    p.description, p.price, p.original_price, p.stock_quantity,
			    p.is_active, p.reject_reason, p.hidden_at, p.hidden_by,
			    p.hidden_reason, p.hidden_by_role, p.created_at,
			    s.shop_name AS shop_name,
			    (
			        SELECT pi.image_url FROM product_image pi
			        WHERE pi.product_id = p.id
			        ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1
			    ) AS image_url,
			    (
			        SELECT JSON_ARRAYAGG(
			            JSON_OBJECT(
			                'id', pi2.id,
			                'image_url', pi2.image_url,
			                'display_order', pi2.display_order,
			                'is_thumbnail', pi2.is_thumbnail
			            )
			        )
			        FROM product_image pi2 WHERE pi2.product_id = p.id
			    ) AS images
			FROM product p
			LEFT JOIN shop s ON s.id = p.shop_id
			ORDER BY p.id DESC
			""";
		System.out.print("GetAll..");
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)){

			  ResultSet rs =	ps.executeQuery();
			  ObjectMapper mapper = new ObjectMapper();
			  while (rs.next()) {
		          Product image = new Product();
		          image.setId(rs.getInt("id"));
		          image.setProduct_name(rs.getString("product_name"));
		          image.setProduct_slug(rs.getString("product_slug"));
		          image.setCategory_id(rs.getInt("category_id"));
		          image.setShop_id(rs.getInt("shop_id"));
		          image.setPrice(rs.getDouble("price"));
		          image.setOriginal_price(rs.getDouble("original_price"));
		          image.setStock_quantity(rs.getInt("stock_quantity"));
		          image.setIs_active(rs.getInt("is_active"));
		          image.setDescription(rs.getString("description"));
		          image.setImage_url(rs.getString("image_url"));
		          try { image.setReject_reason(rs.getString("reject_reason")); } catch (Exception ignore) {}
		          try {
		              var hiddenAt = rs.getTimestamp("hidden_at");
		              if (hiddenAt != null) image.setHiddenAt(hiddenAt.toLocalDateTime());
		          } catch (Exception ignore) {}
		          try {
		              long hiddenBy = rs.getLong("hidden_by");
		              if (!rs.wasNull()) image.setHiddenBy(hiddenBy);
		          } catch (Exception ignore) {}
		          try { image.setHiddenReason(rs.getString("hidden_reason")); } catch (Exception ignore) {}
		          try { image.setHiddenByRole(rs.getString("hidden_by_role")); } catch (Exception ignore) {}
		          try { image.setShop_name(rs.getString("shop_name")); } catch (Exception ignore) {}
		          var ts = rs.getTimestamp("created_at");
		          if (ts != null) image.setCreated_at(ts.toLocalDateTime());
		          String imagesJson = rs.getString("images");
		          if (imagesJson != null && !imagesJson.equals("[]")) {
		              try {
		                  List<ProductImage> images = mapper.readValue(
		                      imagesJson,
		                      mapper.getTypeFactory().constructCollectionType(List.class, ProductImage.class)
		                  );
		                  image.setImages(images);
		              } catch (Exception ex) { image.setImages(new ArrayList<>()); }
		          } else {
		              image.setImages(new ArrayList<>());
		          }
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
        List<Product> products = new ArrayList<>();
        String sql = """
            SELECT 
                p.id,
                p.product_name,
                p.price,
                pi.image_url,
                CASE 
                    WHEN COUNT(pv.id) >= 2 THEN 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pv.id,
                                'product_id',pv.product_id,
                                'sku', pv.sku,
                                'name', pv.variant_name,
                                'price', pv.price,
                                'stock_quantity', pv.stock_quantity,
                                'image_url', pv.image_url
                            )
                        )
                    ELSE JSON_ARRAY()
                END AS variants
            FROM product p
            left join product_image pi on  p.id = pi.product_id and pi.id = (select MIN(id) from product_image where product_id =p.id)
            LEFT JOIN product_variant pv ON p.id = pv.product_id
            WHERE p.shop_id = ?
            GROUP BY p.id, p.product_name, p.price ,pi.image_url
            ORDER BY p.id
            """;
        
        try (Connection conn = dbConnection.getConn();
             PreparedStatement stmt = conn.prepareStatement(sql);
        	
        				) {
       	 stmt.setInt(1, shop_id);
         ResultSet rs = stmt.executeQuery();
        	
        	
            
            ObjectMapper mapper = new ObjectMapper();
            
            while (rs.next()) {
                Product product = new Product();
                product.setId(rs.getInt("id"));
                product.setProduct_name(rs.getString("product_name"));	
                product.setImage_url(rs.getString("image_url"));
                product.setPrice(rs.getDouble("price"));
                
                // Lấy JSON dưới dạng String
                String variantsJson = rs.getString("variants");
                
                // Parse JSON String thành List<VariantDTO>
                if (variantsJson != null && !variantsJson.equals("[]")) {
                    List<ProductVariant> variants = mapper.readValue(
                        variantsJson, 
                        mapper.getTypeFactory().constructCollectionType(
                            List.class, ProductVariant.class
                        )
                    );
                    product.setVariants(variants);
                } else {
                    product.setVariants(new ArrayList<>());
                }
                
                products.add(product);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return products;
	}
	

	 public List<Product> GetProductsWithVariants() {
	        List<Product> products = new ArrayList<>();
	        String sql = """
	            SELECT 
	                p.id,
	                p.product_name,
	                p.price,
	                CASE 
	                    WHEN COUNT(pv.id) >= 2 THEN 
	                        JSON_ARRAYAGG(
	                            JSON_OBJECT(
	                                'id', pv.id,
	                                'product_id',pv.product_id,
	                                'sku', pv.sku,
	                                'price', pv.price,
	                                'stock_quantity', pv.stock_quantity,
	                                'image_url', pv.image_url
	                            )
	                        )
	                    ELSE JSON_ARRAY()
	                END AS variants
	            FROM product p
	            LEFT JOIN product_variant pv ON p.id = pv.product_id
	            GROUP BY p.id, p.product_name, p.price
	            ORDER BY p.id
	            """;
	        
	        try (Connection conn = dbConnection.getConn();
	             PreparedStatement stmt = conn.prepareStatement(sql);
	             ResultSet rs = stmt.executeQuery()) {
	            
	            ObjectMapper mapper = new ObjectMapper();
	            
	            while (rs.next()) {
	                Product product = new Product();
	                product.setId(rs.getInt("id"));
	                product.setProduct_name(rs.getString("product_name"));	
	                product.setPrice(rs.getDouble("price"));
	                
	                // Lấy JSON dưới dạng String
	                String variantsJson = rs.getString("variants");
	                
	                // Parse JSON String thành List<VariantDTO>
	                if (variantsJson != null && !variantsJson.equals("[]")) {
	                    List<ProductVariant> variants = mapper.readValue(
	                        variantsJson, 
	                        mapper.getTypeFactory().constructCollectionType(
	                            List.class, ProductVariant.class
	                        )
	                    );
	                    product.setVariants(variants);
	                } else {
	                    product.setVariants(new ArrayList<>());
	                }
	                
	                products.add(product);
	            }
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	        
	        return products;
	    }

}
