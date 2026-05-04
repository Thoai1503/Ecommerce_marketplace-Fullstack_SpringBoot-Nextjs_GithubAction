package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.HashSet;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.Product;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductRepository;

@RestController("clientProductController")
@RequestMapping("/product")
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
		 //Convert the list to hashSet
		HashSet<Product> set = new HashSet<>(list); 
		
		 
		 
		 
		 return ResponseEntity.ok(set);
	 } 

	 @GetMapping("/search")
	 public ResponseEntity<?> search(
			 @RequestParam(required = false, name = "keyword") String keyword,
			 @RequestParam(required = false, name = "q") String q,
			 @RequestParam(required = false) Integer categoryId,
			 @RequestParam(required = false) Integer brandId,
			 @RequestParam(required = false) Double minPrice,
			 @RequestParam(required = false) Double maxPrice,
			 @RequestParam(required = false, defaultValue = "popular") String sort,
			 @RequestParam(required = false, defaultValue = "1") Integer page,
			 @RequestParam(required = false, defaultValue = "24") Integer limit) {
		 String searchKeyword = keyword != null ? keyword : q;
		 var products = ((ProductRepository) repositories).searchProducts(
				 searchKeyword,
				 categoryId,
				 brandId,
				 minPrice,
				 maxPrice,
				 sort,
				 page == null ? 1 : page,
				 limit == null ? 24 : limit);

		 return ResponseEntity.ok(products);
	 }

	 @GetMapping("/suggestions")
	 public ResponseEntity<?> suggestions(
			 @RequestParam(required = false, name = "keyword") String keyword,
			 @RequestParam(required = false, name = "q") String q,
			 @RequestParam(required = false, defaultValue = "10") Integer limit) {
		 String searchKeyword = keyword != null ? keyword : q;
		 var suggestions = ((ProductRepository) repositories).searchSuggestions(
				 searchKeyword,
				 limit == null ? 10 : limit);

		 return ResponseEntity.ok(suggestions);
	 }
	
	 @GetMapping("/{id}")
	 public ResponseEntity getById(@PathVariable Integer id) {
		 var product = repositories.GetById(id);
		 
		 if(product == null) {
			 return ResponseEntity.notFound().build();
		 }
		 
		 return ResponseEntity.ok(product);
	 }


	@GetMapping("/with-shop/{id}")
	public ResponseEntity getByIdWithShop(@PathVariable Integer id) {
		var product = ((ProductRepository) repositories).GetByIdWithShopInfo(id);

		if (product == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(product);
	}

	@GetMapping("/shop/{shopId}")
	public ResponseEntity<?> getByShopId(@PathVariable int shopId) {

		var products = ((ProductRepository) repositories).GetActiveByShopId(shopId);

		return ResponseEntity.ok(products);
	}

	@GetMapping("/shop/{shopId}/categories")
	public ResponseEntity<?> getCategoriesByShop(@PathVariable int shopId) {

		var categories = ((ProductRepository) repositories).getActiveCategoriesByShop(shopId);

		return ResponseEntity.ok(categories);
	}
	@PutMapping("/{id}")
	public ResponseEntity<?> updateProduct(@PathVariable int id, @RequestBody Product updatedProduct) {
		 
		return ResponseEntity.ok(((ProductRepository) repositories).Update(updatedProduct));
	}
}

//
