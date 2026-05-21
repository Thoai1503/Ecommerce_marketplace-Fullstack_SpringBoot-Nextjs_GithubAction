package docker_test.com.controllers.seller;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductAttribute;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.NotificationRepository;
import docker_test.com.repository.ProductAttributeRepository;
import docker_test.com.repository.ProductRepository;
import docker_test.com.repository.ShopRepository;

@RestController("sellerProductController")
@RequestMapping("/seller/product")
public class ProductController {
	 private final IRepositories repositories;
	 private final IRepoFactory iRepoFactory;
	 private final ProductAttributeRepository productAttributeRepository;
	 private final NotificationRepository notificationRepository;
	 private final ShopRepository shopRepository;
	 
	 public ProductController (RepoFactoryImpl factoryImpl) {
		 this.iRepoFactory= factoryImpl;
		 this.repositories = iRepoFactory.createRepo("product");
		 this.productAttributeRepository = ProductAttributeRepository.Instance();
		 this.notificationRepository = NotificationRepository.Instance();
		 this.shopRepository = ShopRepository.Instance();
	 }
        
	 
	 
	 @GetMapping("")
	 public ResponseEntity getAll() {
		 var list =((ProductRepository) repositories).GetProductsWithVariants();
		 
		 return ResponseEntity.ok(list);
	 } 
	
	 @PostMapping("")
	 public ResponseEntity create(@RequestBody Product product) throws SQLException {
		
		 System.out.print("Send..");
		 var attributes = product.getAttributes();

		 Product en;
		 try {
			 en = (Product) repositories.Create(product);
		 } catch (SQLException ex) {
			 if (ProductRepository.DUPLICATE_PRODUCT_NAME_MESSAGE.equals(ex.getMessage())) {
				 return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
			 }
			 throw ex;
		 }

		 if (en == null) {
			 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Tạo sản phẩm thất bại");
		 }

		 if (en != null && en.getId() != null && attributes != null && !attributes.isEmpty()) {
			 try {
				 attributes.forEach(attribute -> attribute.setProductId(en.getId()));
				 en.setAttributes(productAttributeRepository.ReplaceByProductId(en.getId(), attributes));
			 } catch (SQLException ex) {
				 ex.printStackTrace();
			 }
		 }
		 sendProductCreatedNotification(en);
		 
		 
		 return ResponseEntity.ok(en);
	 }

	 private void sendProductCreatedNotification(Product product) {
		 if (product == null || product.getId() == null || product.getShop_id() == null) {
			 return;
		 }

		 var shop = shopRepository.GetById(product.getShop_id());
		 String shopName = shop != null && hasText(shop.getShop_name()) ? shop.getShop_name() : "Shop bạn theo dõi";
		 String productName = hasText(product.getProduct_name()) ? product.getProduct_name() : "sản phẩm mới";

		 notificationRepository.CreateForShopFollowers(
				 product.getShop_id(),
				 "shop",
				 shopName + " có sản phẩm mới",
				 shopName + " vừa đăng " + productName + ". Xem ngay sản phẩm mới từ shop bạn theo dõi.",
				 product.getShop_id().longValue());
	 }

	 private boolean hasText(String value) {
		 return value != null && !value.isBlank();
	 }

	 @PostMapping("{id}/attributes")
	 public ResponseEntity saveAttributes(@PathVariable int id, @RequestBody List<Map<String, Object>> attributes)
			 throws SQLException {
		 List<ProductAttribute> productAttributes = mapProductAttributes(id, attributes);

		 var saved = productAttributeRepository.ReplaceByProductId(
				 id,
				 productAttributes);

		 return ResponseEntity.ok(saved);
	 }

	 private List<ProductAttribute> mapProductAttributes(int productId, List<Map<String, Object>> attributes) {
		 if (attributes == null) {
			 return List.of();
		 }

		 List<ProductAttribute> result = new ArrayList<>();
		 for (Map<String, Object> attributePayload : attributes) {
			 if (attributePayload == null) {
				 continue;
			 }

			 ProductAttribute attribute = new ProductAttribute();
			 attribute.setProductId(productId);
			 attribute.setAttributeId(toInt(valueOf(attributePayload, "attributeId", "attribute_id"), 0));
			 attribute.setAttributeValueId(toInteger(valueOf(attributePayload, "attributeValueId", "attribute_value_id")));
			 attribute.setValueText(toText(valueOf(attributePayload, "valueText", "value_text")));
			 attribute.setValueNumber(toDouble(valueOf(attributePayload, "valueNumber", "value_number")));
			 attribute.setValueDate(toLocalDate(valueOf(attributePayload, "valueDate", "value_date")));
			 attribute.setUnitId(toInteger(valueOf(attributePayload, "unitId", "unit_id")));
			 result.add(attribute);
		 }

		 return result;
	 }

	 private Object valueOf(Map<String, Object> payload, String... keys) {
		 for (String key : keys) {
			 if (payload.containsKey(key)) {
				 return payload.get(key);
			 }
		 }
		 return null;
	 }

	 private Integer toInteger(Object value) {
		 if (value == null) {
			 return null;
		 }
		 if (value instanceof Number number) {
			 return number.intValue();
		 }
		 try {
			 String text = String.valueOf(value).trim();
			 return text.isEmpty() ? null : Integer.parseInt(text);
		 } catch (NumberFormatException ignored) {
			 return null;
		 }
	 }

	 private int toInt(Object value, int defaultValue) {
		 Integer parsed = toInteger(value);
		 return parsed == null ? defaultValue : parsed;
	 }

	 private Double toDouble(Object value) {
		 if (value == null) {
			 return null;
		 }
		 if (value instanceof Number number) {
			 return number.doubleValue();
		 }
		 try {
			 String text = String.valueOf(value).trim();
			 return text.isEmpty() ? null : Double.parseDouble(text);
		 } catch (NumberFormatException ignored) {
			 return null;
		 }
	 }

	 private String toText(Object value) {
		 if (value == null) {
			 return null;
		 }
		 String text = String.valueOf(value).trim();
		 return text.isEmpty() ? null : text;
	 }

	 private LocalDate toLocalDate(Object value) {
		 String text = toText(value);
		 if (text == null) {
			 return null;
		 }
		 try {
			 return LocalDate.parse(text);
		 } catch (DateTimeParseException ignored) {
			 return null;
		 }
	 }

	 @GetMapping("{id}/attributes")
	 public ResponseEntity getAttributes(@PathVariable int id) {
		 return ResponseEntity.ok(productAttributeRepository.GetByProductId(id));
	 }

	 @GetMapping("{id}")
	 public ResponseEntity getById( @PathVariable int id) {
		
		 System.out.print("Send get by id..");
		 
		 var en = repositories.GetById(id);
		 
		 
		 return ResponseEntity.ok(en);
	 }
	 @GetMapping("shop/{id}")
	 public ResponseEntity getByShopId( @PathVariable int id) {
		
		 System.out.print("Send get by shop id..");
		 
		 var en = ((ProductRepository)repositories).GetByShopId(id);
		 
		 
		 return ResponseEntity.ok(en);
	 }
	
}
