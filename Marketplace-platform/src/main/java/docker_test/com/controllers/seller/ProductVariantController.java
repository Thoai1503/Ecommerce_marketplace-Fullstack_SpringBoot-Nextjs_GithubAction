package docker_test.com.controllers.seller;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.ProductVariant;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductVariantRepository;

@RestController("/seller/product-variant")
@RequestMapping("/seller/product-variant")
public class ProductVariantController  {
	
	 private final IRepositories repositories;
	 private final IRepoFactory iRepoFactory;
	 
	 public ProductVariantController 
	
	(RepoFactoryImpl factoryImpl) {
		 this.iRepoFactory= factoryImpl;
		 this.repositories = iRepoFactory.createRepo("product_variant");
	 }

	@GetMapping("/product/{id}")
	public ResponseEntity   getByProductId(@PathVariable int id) {
		var list = ((ProductVariantRepository)repositories).GetByProductId(id);
		return ResponseEntity.ok(list);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity getById(@PathVariable int id) {
		var variant = repositories.GetById(id);
		if (variant == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(variant);
	}
	
	@PostMapping("")
	public ResponseEntity   create(@RequestBody ProductVariant productVariant) throws SQLException {
		var en = ((ProductVariantRepository)repositories).Create(productVariant);
		return ResponseEntity.ok(en);
	}
}
