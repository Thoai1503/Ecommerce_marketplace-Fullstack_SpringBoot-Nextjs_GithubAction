 package docker_test.com.repository;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import docker_test.com.configs.DBConnection;
import docker_test.com.factory.RepoFactoryImpl;
//import docker_test.com.jdbc.JDBC;
import docker_test.com.mappers.product.ProductMapper;
import docker_test.com.models.Category;
import docker_test.com.models.Shop;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductImage;
import docker_test.com.models.product.ProductVariant;
import tools.jackson.databind.ObjectMapper;

//@Repository
public class ProductRepository implements IRepositories<Product> {

	private DBConnection dbConnection;
	private static ProductRepository instance = null;

	public static ProductRepository Instance() {
		if (instance == null) {
			instance = new ProductRepository();
		}
		return instance;
	}

	public ProductRepository() {
		this.dbConnection = DBConnection.getInstance();
	}

	@Override
	public Product Create(Product item) throws SQLException {
		System.out.print("Body: " + item.toString());
		String sql = "insert into product (shop_id,category_id,description,product_name,product_slug,price,original_price) values (?,?,?,?,?,?,?)";
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			ps.setLong(1, item.getShop_id());
			ps.setLong(2, item.getCategory_id());
			ps.setString(3, item.getDescription());

			ps.setString(4, item.getProduct_name());
			ps.setString(5, item.getProduct_slug());
			ps.setDouble(6, item.getPrice());
			ps.setDouble(7, item.getOriginal_price());

			int rows = ps.executeUpdate();

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
				    p.brand,
				    p.is_active,
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
				        )
				        FROM product_image pi
				        WHERE pi.product_id = p.id
				        ORDER BY pi.display_order ASC
				    ) AS images,
				    (
				        SELECT JSON_ARRAYAGG(
				            JSON_OBJECT(
				                'id', pv.id,
				                'product_id',pv.product_id,
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
		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();
			ObjectMapper mapper = new ObjectMapper();

			while (rs.next()) {
				Product product = new Product();
				product.setId(rs.getInt("id"));

				product.setProduct_name(rs.getString("product_name"));
				product.setProduct_slug(rs.getString("product_slug"));
				// product.setImage_url(rs.getString("image_url"));
				product.setPrice(rs.getDouble("price"));

				// Lấy JSON dưới dạng String
				String variantsJson = rs.getString("variants");

				// Parse JSON String thành List<VariantDTO>
				if (variantsJson != null && !variantsJson.equals("[]")) {
					List<ProductVariant> variants = mapper.readValue(variantsJson,
							mapper.getTypeFactory().constructCollectionType(List.class, ProductVariant.class));
					product.setVariants(variants);
				} else {
					product.setVariants(new ArrayList<>());
				}
				String imagesJson = rs.getString("images");

				// Parse JSON String thành List<ProductImage>
				if (imagesJson != null && !imagesJson.equals("[]")) {
					List<ProductImage> images = mapper.readValue(imagesJson,
							mapper.getTypeFactory().constructCollectionType(List.class, ProductImage.class));
					product.setImages(images);
				} else {
					product.setImages(new ArrayList<>());
				}

				System.out.println("Product: " + product.toString());
				return product;
			}

		} catch (Exception ex) {
			ex.printStackTrace();
			;
		}
		return null;
	}

	@Override
	public List<Product> GetAll() {
		System.out.print("Get all..");
		List<Product> list = new ArrayList<Product>();
		String sql = "SELECT \r\n" + "    p.*,\r\n" + "    pi.image_url\r\n" + "FROM product p\r\n"
				+ "LEFT JOIN product_image pi ON p.id = pi.product_id \r\n" + "    AND pi.id = (\r\n"
				+ "        SELECT MIN(id) \r\n" + "        FROM product_image \r\n"
				+ "        WHERE product_id = p.id\r\n" + "    )";
		System.out.print("GetAll..");
		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Product image = new Product();
				image.setId(rs.getInt("id"));
				image.setProduct_name(rs.getString("product_name"));
				image.setProduct_slug(rs.getString("product_slug"));
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

		} catch (Exception ex) {
			ex.printStackTrace();
			;
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

		try (Connection conn = dbConnection.getConn(); PreparedStatement stmt = conn.prepareStatement(sql);

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
					List<ProductVariant> variants = mapper.readValue(variantsJson,
							mapper.getTypeFactory().constructCollectionType(List.class, ProductVariant.class));
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
					List<ProductVariant> variants = mapper.readValue(variantsJson,
							mapper.getTypeFactory().constructCollectionType(List.class, ProductVariant.class));
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
	
	public List<Map<String, Object>> query(String sql, Object... params) {

	    List<Map<String, Object>> list = new ArrayList<>();

	    try (
	        Connection con = DBConnection.getConn();
	        PreparedStatement ps = con.prepareStatement(sql)
	    ) {

	        // set params
	        for (int i = 0; i < params.length; i++) {
	            ps.setObject(i + 1, params[i]);
	        }

	        ResultSet rs = ps.executeQuery();
	        ResultSetMetaData meta = rs.getMetaData();

	        while (rs.next()) {

	            Map<String, Object> row = new HashMap<>();

	            for (int i = 1; i <= meta.getColumnCount(); i++) {
	                row.put(meta.getColumnName(i), rs.getObject(i));
	            }

	            list.add(row);
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	 
	 //get product by id with shop info
	 public Product GetByIdWithShopInfo(int id) {
		 String sql = """
		 		SELECT
		 			p.id,
		 			p.product_name,
		 			p.price,
		 			s.id AS shop_id,
		 			s.shop_name,
		 			(
		 				SELECT JSON_ARRAYAGG(
		 					JSON_OBJECT(
		 						'id', pi.id,
		 						'image_url', pi.image_url,
		 						'display_order', pi.display_order,
		 						'is_thumbnail', pi.is_thumbnail
		 					)
		 				)
		 				FROM product_image pi
		 				WHERE pi.product_id = p.id
		 				ORDER BY pi.display_order ASC
		 			) AS images
		 			FROM product p
		 			LEFT JOIN shop s ON p.shop_id = s.id
		 			WHERE p.id = ?;
		 			
		 							""";
		
		 System.out.print("Get by id with shop info..");
		 try (Connection con = dbConnection.getConn();
					PreparedStatement ps = con.prepareStatement(sql)){
	
			  ps.setInt(1, id);
			  ResultSet rs =	ps.executeQuery();
			  ObjectMapper mapper = new ObjectMapper();
	            
	            while (rs.next()) {
	                Product product = new Product();
	                product.setId(rs.getInt("id"));
	                product.setProduct_name(rs.getString("product_name"));	
	                product.setPrice(rs.getDouble("price"));
	                
	                Shop shop = new Shop();
	                shop.setId(rs.getInt("shop_id"));
	                shop.setShop_name(rs.getString("shop_name"));
	                product.setShop(shop);
	                
	                // Lấy JSON dưới dạng String
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

	    return list;
	}

}
