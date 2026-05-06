package docker_test.com.controllers.seller;

import java.sql.SQLException;
import java.util.List;

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
import docker_test.com.repository.ProductAttributeRepository;
import docker_test.com.repository.ProductRepository;

@RestController("sellerProductController")
@RequestMapping("/seller/product")
public class ProductController {
	 private final IRepositories repositories;
	 private final IRepoFactory iRepoFactory;
	 private final ProductAttributeRepository productAttributeRepository;
	 
	 public ProductController (RepoFactoryImpl factoryImpl) {
		 this.iRepoFactory= factoryImpl;
		 this.repositories = iRepoFactory.createRepo("product");
		 this.productAttributeRepository = ProductAttributeRepository.Instance();
	 }
        
	 
	 
	 @GetMapping("")
	 public ResponseEntity getAll() {
		 var list =((ProductRepository) repositories).GetProductsWithVariants();
		 
		 return ResponseEntity.ok(list);
	 } 
	
	 @PostMapping("")
	 public ResponseEntity create(@RequestBody Product product) throws SQLException {
		
		 System.out.print("Send..");
		 
		 var en = repositories.Create(product);
		 
		 
		 return ResponseEntity.ok(en);
	 }

	 @PostMapping("{id}/attributes")
	 public ResponseEntity saveAttributes(@PathVariable int id, @RequestBody List<ProductAttribute> attributes)
			 throws SQLException {
		 if (attributes != null) {
			 attributes.forEach(attribute -> attribute.setProductId(id));
		 }

		 var saved = productAttributeRepository.ReplaceByProductId(
				 id,
				 attributes == null ? List.of() : attributes);

		 return ResponseEntity.ok(saved);
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
