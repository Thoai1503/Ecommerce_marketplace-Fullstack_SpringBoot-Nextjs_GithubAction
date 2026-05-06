package docker_test.com.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
		String sql = "insert into product (shop_id,category_id,description,product_name,product_slug,price,original_price,weight,length,width,height,stock_quantity,brand_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
		try (Connection con = dbConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			ps.setLong(1, item.getShop_id());
			ps.setLong(2, item.getCategory_id());
			ps.setString(3, item.getDescription());

			ps.setString(4, item.getProduct_name());
			ps.setString(5, item.getProduct_slug());
			ps.setDouble(6, item.getPrice());
			ps.setDouble(7, item.getOriginal_price());

			ps.setInt(8, item.getWeight());
			ps.setInt(9, item.getLength());
			ps.setInt(10, item.getWidth());
			ps.setInt(11, item.getHeight());
			ps.setInt(12, item.getStock_quantity());
			ps.setObject(13, item.getBrand());

			int rows = ps.executeUpdate();

			if (rows > 0) {
				try (ResultSet rs = ps.getGeneratedKeys()) {
					if (rs.next()) {
						var id = rs.getInt(1);
						item.setId(id);
						System.out.println("ID user mới: " + id);
					}
				}
			}
			return item;
		} catch (Exception ex) {
			ex.printStackTrace();
			;
		}
		return null;
	}

	@Override
	public Product Update(Product item) {
	
		 String sql = "update product set shop_id=?,category_id=?,description=?,product_name=?,product_slug=?,price=?,original_price=?,weight=?,length=?,width=?,height=?,stock_quantity=?,brand_id=? where id=?";
		 try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {
			 ps.setLong(1, item.getShop_id());
			 ps.setLong(2, item.getCategory_id());
			 ps.setString(3, item.getDescription());
			 ps.setString(4, item.getProduct_name());
			 ps.setString(5, item.getProduct_slug());
			 ps.setDouble(6, item.getPrice());
			 ps.setDouble(7, item.getOriginal_price());
			 ps.setInt(8, item.getWeight());
			 ps.setInt(9, item.getLength());
			 ps.setInt(10, item.getWidth());
			 ps.setInt(11, item.getHeight());
			 ps.setInt(12, item.getStock_quantity());
			 ps.setObject(13, item.getBrand());
			 ps.setInt(14, item.getId());

			 int rows = ps.executeUpdate();

			 if (rows > 0) {
				 return item;
			 }
		 } catch (Exception ex) {
			 ex.printStackTrace();
		 }
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
				    p.brand_id,
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
				                'weight', pv.weight,
				                'width', pv.width,
				                'height', pv.height,
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
				product.setShop_id(rs.getInt("shop_id"));
				product.setCategory_id(rs.getInt("category_id"));
				product.setProduct_name(rs.getString("product_name"));
				product.setProduct_slug(rs.getString("product_slug"));
				product.setPrice(rs.getDouble("price"));
				product.setOriginal_price(rs.getDouble("original_price"));
				product.setDescription(rs.getString("description"));
				product.setStock_quantity(rs.getInt("stock_quantity"));
				product.setWeight(rs.getInt("weight"));
				product.setLength(rs.getInt("length"));
				product.setWidth(rs.getInt("width"));
				product.setHeight(rs.getInt("height"));
				int brandId = rs.getInt("brand_id");
				if (!rs.wasNull()) {
					product.setBrand(brandId);
				}
			     

				String variantsJson = rs.getString("variants");

				if (variantsJson != null && !variantsJson.equals("[]")) {
					List<ProductVariant> variants = mapper.readValue(variantsJson,
							mapper.getTypeFactory().constructCollectionType(List.class, ProductVariant.class));
					product.setVariants(variants);
				} else {
					product.setVariants(new ArrayList<>());
				}
				String imagesJson = rs.getString("images");

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
				image.setCategory_id(rs.getInt("category_id"));
				image.setShop_id(rs.getInt("shop_id"));
				image.setPrice(rs.getDouble("price"));
				image.setOriginal_price(rs.getDouble("original_price"));
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

	private List<Product> getProductsByShopId(int shop_id, boolean onlyActive) {
		List<Product> products = new ArrayList<>();
		String sql = """
				SELECT
				    p.id,
				    p.shop_id,
				    p.category_id,
				    c.category_name,  
				    p.product_name,
				    p.product_slug,
				    p.description,
				    p.price,
				    p.original_price,
				    p.stock_quantity,
				    p.is_active,
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
				LEFT JOIN category c ON p.category_id = c.id
				left join product_image pi on  p.id = pi.product_id and pi.id = (select MIN(id) from product_image where product_id =p.id)
				LEFT JOIN product_variant pv ON p.id = pv.product_id AND pv.is_active = 1
				WHERE p.shop_id = ?
				  AND (? = FALSE OR p.is_active = 1)
				GROUP BY p.id, p.shop_id, p.category_id, c.category_name, p.product_name, p.product_slug,
				         p.description, p.price, p.original_price, p.stock_quantity, p.is_active, pi.image_url
				ORDER BY p.id
				""";

		try (Connection conn = dbConnection.getConn(); PreparedStatement stmt = conn.prepareStatement(sql);

		) {
			stmt.setInt(1, shop_id);
			stmt.setBoolean(2, onlyActive);
			ResultSet rs = stmt.executeQuery();

			ObjectMapper mapper = new ObjectMapper();

			while (rs.next()) {
				Product product = new Product();
				product.setId(rs.getInt("id"));
				product.setShop_id(rs.getInt("shop_id"));
				product.setCategory_id(rs.getInt("category_id"));
				product.setCategory_name(rs.getString("category_name"));
				product.setProduct_name(rs.getString("product_name"));
				product.setProduct_slug(rs.getString("product_slug"));
				product.setDescription(rs.getString("description"));
				product.setImage_url(rs.getString("image_url"));
				product.setPrice(rs.getDouble("price"));
				product.setOriginal_price(rs.getDouble("original_price"));
				product.setStock_quantity(rs.getInt("stock_quantity"));
				product.setIs_active(rs.getInt("is_active"));

				String variantsJson = rs.getString("variants");

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

	public List<Product> GetByShopId(int shop_id) {
		return getProductsByShopId(shop_id, false);
	}

	public List<Product> GetActiveByShopId(int shop_id) {
		return getProductsByShopId(shop_id, true);
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

				String variantsJson = rs.getString("variants");

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

		try (Connection con = DBConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

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
			return list;

		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}

	private List<String> expandSearchTerms(String keyword) {
		Set<String> terms = new LinkedHashSet<>();
		if (keyword == null) {
			return new ArrayList<>();
		}

		String value = keyword.trim().toLowerCase();
		if (value.isEmpty()) {
			return new ArrayList<>();
		}

		terms.add(value);

		if (value.equals("tv") || value.contains(" tv") || value.contains("tv ")) {
			terms.add(value.replace("tv", "tivi").trim());
			terms.add(value.replace("tv", "television").trim());
		}

		if (value.equals("tivi") || value.contains(" tivi") || value.contains("tivi ")) {
			terms.add(value.replace("tivi", "tv").trim());
			terms.add(value.replace("tivi", "television").trim());
		}

		if (value.equals("television") || value.contains(" television") || value.contains("television ")) {
			terms.add(value.replace("television", "tv").trim());
			terms.add(value.replace("television", "tivi").trim());
		}

		terms.remove("");
		return new ArrayList<>(terms);
	}

	private void appendKeywordFilter(StringBuilder sql, List<Object> params, String keyword, String... columns) {
		List<String> terms = expandSearchTerms(keyword);
		if (terms.isEmpty() || columns.length == 0) {
			return;
		}

		sql.append(" AND (");
		List<String> filters = new ArrayList<>();
		for (String term : terms) {
			for (String column : columns) {
				filters.add(column + " LIKE ?");
				params.add("%" + term + "%");
			}
		}
		sql.append(String.join(" OR ", filters));
		sql.append(")");
	}

	private String buildLikeFilter(List<String> terms, String... columns) {
		List<String> filters = new ArrayList<>();
		for (String ignored : terms) {
			for (String column : columns) {
				filters.add(column + " LIKE ?");
			}
		}
		return "(" + String.join(" OR ", filters) + ")";
	}

	private void addLikeParams(List<Object> params, List<String> terms, int columnCount) {
		for (String term : terms) {
			for (int i = 0; i < columnCount; i++) {
				params.add("%" + term + "%");
			}
		}
	}

	public List<Map<String, Object>> searchProducts(
			String keyword,
			Integer categoryId,
			Integer brandId,
			Double minPrice,
			Double maxPrice,
			String sort,
			int page,
			int limit) {

		List<Object> params = new ArrayList<>();
		StringBuilder sql = new StringBuilder("""
				    SELECT
				        p.id,
				        p.shop_id,
				        p.category_id,
				        c.category_name,
				        p.brand_id,
				        b.name AS brand_name,
				        s.shop_name,
				        p.product_name,
				        p.product_slug,
				        p.description,
				        p.price,
				        p.original_price,
				        p.stock_quantity,
				        p.sold_count,
				        p.rating,
				        p.review_count,
				        p.created_at,
				        (
				            SELECT pi.image_url
				            FROM product_image pi
				            WHERE pi.product_id = p.id
				            ORDER BY pi.is_thumbnail DESC, pi.display_order ASC, pi.id ASC
				            LIMIT 1
				        ) AS image_url
				    FROM product p
				    LEFT JOIN category c ON p.category_id = c.id
				    LEFT JOIN brand b ON p.brand_id = b.id
				    LEFT JOIN shop s ON p.shop_id = s.id
				    WHERE p.is_active = 1
				      AND (p.status IS NULL OR p.status NOT IN ('REJECTED', 'HIDDEN'))
				""");

		appendKeywordFilter(
				sql,
				params,
				keyword,
				"p.product_name",
				"p.product_slug",
				"p.description",
				"c.category_name",
				"b.name",
				"s.shop_name");

		if (categoryId != null && categoryId > 0) {
			sql.append("""
					      AND (
					          p.category_id = ?
					          OR p.category_id IN (SELECT id FROM category WHERE parent_id = ?)
					      )
					""");
			params.add(categoryId);
			params.add(categoryId);
		}

		if (brandId != null && brandId > 0) {
			sql.append(" AND p.brand_id = ?");
			params.add(brandId);
		}

		if (minPrice != null && minPrice >= 0) {
			sql.append(" AND p.price >= ?");
			params.add(minPrice);
		}

		if (maxPrice != null && maxPrice >= 0) {
			sql.append(" AND p.price <= ?");
			params.add(maxPrice);
		}

		sql.append(" ORDER BY ");
		switch (sort == null ? "" : sort) {
		case "price_asc":
			sql.append("p.price ASC, p.id DESC");
			break;
		case "price_desc":
			sql.append("p.price DESC, p.id DESC");
			break;
		case "newest":
			sql.append("p.created_at DESC, p.id DESC");
			break;
		case "rating":
			sql.append("p.rating DESC, p.review_count DESC, p.id DESC");
			break;
		case "sold":
		case "popular":
		default:
			sql.append("p.sold_count DESC, p.rating DESC, p.id DESC");
			break;
		}

		int safeLimit = Math.max(1, Math.min(limit, 60));
		int safePage = Math.max(1, page);
		sql.append(" LIMIT ? OFFSET ?");
		params.add(safeLimit);
		params.add((safePage - 1) * safeLimit);

		return query(sql.toString(), params.toArray());
	}

	public List<Map<String, Object>> searchSuggestions(String keyword, int limit) {
		if (keyword == null || keyword.trim().isEmpty()) {
			return new ArrayList<>();
		}

		List<String> terms = expandSearchTerms(keyword);
		int safeLimit = Math.max(1, Math.min(limit, 20));

		String categoryFilter = buildLikeFilter(terms, "c.category_name", "c.category_slug");
		String productFilter = buildLikeFilter(terms, "p.product_name", "p.product_slug", "p.description");
		String brandFilter = buildLikeFilter(terms, "b.name", "b.slug");
		String unitFilter = buildLikeFilter(terms, "u.label", "u.symbol");
		String attributeFilter = buildLikeFilter(terms, "a.name", "a.slug");
		String valueFilter = buildLikeFilter(terms, "av.value", "u.label", "u.symbol");

		String sql = """
				SELECT text, type, score
				FROM (
				    SELECT
				        c.category_name AS text,
				        'category' AS type,
				        100 + COUNT(p.id) AS score
				    FROM category c
				    LEFT JOIN product p ON p.category_id = c.id AND p.is_active = 1
				    WHERE c.is_active = 1
				      AND %s
				    GROUP BY c.id, c.category_name

				    UNION ALL

				    SELECT
				        p.product_name AS text,
				        'product' AS type,
				        80 + COALESCE(p.sold_count, 0) AS score
				    FROM product p
				    WHERE p.is_active = 1
				      AND (p.status IS NULL OR p.status NOT IN ('REJECTED', 'HIDDEN'))
				      AND %s

				    UNION ALL

				    SELECT
				        b.name AS text,
				        'brand' AS type,
				        70 + COUNT(p.id) AS score
				    FROM brand b
				    LEFT JOIN product p ON p.brand_id = b.id AND p.is_active = 1
				    WHERE b.status = 1
				      AND %s
				    GROUP BY b.id, b.name

				    UNION ALL

				    SELECT
				        u.label AS text,
				        'unit' AS type,
				        50 AS score
				    FROM unit u
				    WHERE u.status = 1
				      AND %s

				    UNION ALL

				    SELECT
				        a.name AS text,
				        'attribute' AS type,
				        45 AS score
				    FROM attribute a
				    WHERE a.status = 1
				      AND %s

				    UNION ALL

				    SELECT
				        CONCAT(av.value, COALESCE(CONCAT(' ', u.symbol), '')) AS text,
				        'value' AS type,
				        40 AS score
				    FROM attribute_value av
				    LEFT JOIN unit u ON av.unit_id = u.id
				    WHERE %s
				) suggestions
				WHERE text IS NOT NULL AND text <> ''
				ORDER BY score DESC, CHAR_LENGTH(text) ASC, text ASC
				LIMIT ?
				""".formatted(categoryFilter, productFilter, brandFilter, unitFilter, attributeFilter, valueFilter);

		List<Object> params = new ArrayList<>();
		addLikeParams(params, terms, 2);
		addLikeParams(params, terms, 3);
		addLikeParams(params, terms, 2);
		addLikeParams(params, terms, 2);
		addLikeParams(params, terms, 2);
		addLikeParams(params, terms, 3);
		params.add(safeLimit);

		return query(sql, params.toArray());
	}

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
				    WHERE p.id = ?
				""";

		System.out.print("Get by id with shop info..");

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			ObjectMapper mapper = new ObjectMapper();

			if (rs.next()) {
				Product product = new Product();

				// ===== PRODUCT =====
				product.setId(rs.getInt("id"));
				product.setProduct_name(rs.getString("product_name"));
				product.setPrice(rs.getDouble("price"));

				// ===== SHOP_ID =====
				int shopId = rs.getInt("shop_id");
				product.setShop_id(shopId);

				// ===== SHOP OBJECT =====
				if (shopId > 0) {
					Shop shop = new Shop();
					shop.setId(shopId);
					shop.setShop_name(rs.getString("shop_name"));
					product.setShop(shop);
				}

				// ===== IMAGES =====
				String imagesJson = rs.getString("images");

				if (imagesJson != null && !imagesJson.equals("[]")) {
					List<ProductImage> images = mapper.readValue(imagesJson,
							mapper.getTypeFactory().constructCollectionType(List.class, ProductImage.class));
					product.setImages(images);
				} else {
					product.setImages(new ArrayList<>());
				}

				System.out.println("Product: " + product);
				return product;
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return null;
	}

	public int countProductByShop(int shopId) {
		String sql = "SELECT COUNT(*) FROM product WHERE shop_id = ?";

		try (Connection con = dbConnection.getConn(); PreparedStatement ps = con.prepareStatement(sql)) {

			ps.setInt(1, shopId);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				return rs.getInt(1);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return 0;
	}

	public List<Category> getCategoriesByShop(int shopId) {
		return getCategoriesByShop(shopId, false);
	}

	public List<Category> getActiveCategoriesByShop(int shopId) {
		return getCategoriesByShop(shopId, true);
	}

	private List<Category> getCategoriesByShop(int shopId, boolean onlyActive) {

		List<Category> categories = new ArrayList<>();

		String sql = """
				    SELECT DISTINCT
				        c.id,
				        c.category_name
				    FROM product p
				    JOIN category c ON p.category_id = c.id
				    WHERE p.shop_id = ?
				      AND (? = FALSE OR p.is_active = 1)
				""";

		try (Connection conn = dbConnection.getConn(); PreparedStatement stmt = conn.prepareStatement(sql)) {

			stmt.setInt(1, shopId);
			stmt.setBoolean(2, onlyActive);
			ResultSet rs = stmt.executeQuery();

			while (rs.next()) {
				Category c = new Category();
				c.setId(rs.getInt("id"));
				c.setCategory_name(rs.getString("category_name"));

				categories.add(c);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return categories;
	}
}
