package docker_test.com.controllers.seller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.Product;
import docker_test.com.repository.IRepositories;

@RestController
@RequestMapping("/seller/product")
public class ProductController {
	 private final IRepositories repositories;
	 private final IRepoFactory iRepoFactory;
	 
	 public ProductController (RepoFactoryImpl factoryImpl) {
		 this.iRepoFactory= factoryImpl;
		 this.repositories = iRepoFactory.createRepo("product");
	 }
        
	 
	 
	 @GetMapping("")
	 public ResponseEntity getAll() {
		 var list = repositories.GetAll();
		 
		 return ResponseEntity.ok(list);
	 } 
	
	 @PostMapping("")
	 public ResponseEntity create(@RequestBody Product product) {
		 
		 
		 return null;
	 }
	
}
