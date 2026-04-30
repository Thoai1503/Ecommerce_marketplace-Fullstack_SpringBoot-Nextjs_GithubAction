package docker_test.com.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.ProductVariant;
import docker_test.com.repository.IRepositories;

@RestController("clientProductVariantController")
@RequestMapping("/product-variant")


public class ProductVariantController {
	 private final IRepositories repositories;
	 private final IRepoFactory iRepoFactory;
	 
	 public ProductVariantController(RepoFactoryImpl factoryImpl) {
		 this.iRepoFactory = factoryImpl;
		 this.repositories = iRepoFactory.createRepo("product_variant");
	 }

	 @GetMapping("/{id}")
	 public ResponseEntity getById(@PathVariable int id) {
		 var variant = repositories.GetById(id);
		 if (variant == null) {
			 return ResponseEntity.notFound().build();
		 }
		 return ResponseEntity.ok(variant);
	 }
	 
	 @PutMapping("/{id}")
	 public ResponseEntity updateProductVariant(@PathVariable int id, @RequestBody ProductVariant updatedVariant) {
         
		 System.out.println ("Product variant :"+ updatedVariant.toString());
		 
		 var savedVariant = repositories.Update(updatedVariant);
		 return ResponseEntity.ok(savedVariant);
	 }

}
