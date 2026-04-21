package docker_test.com.controllers;

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
import docker_test.com.models.product.Product;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductRepository;

@RestController("clientProductController")
@RequestMapping("/product")
public class ProductController {
	private final IRepositories repositories;
	private final IRepoFactory iRepoFactory;

	public ProductController(RepoFactoryImpl factoryImpl) {
		this.iRepoFactory = factoryImpl;
		this.repositories = iRepoFactory.createRepo("product");
	}

	@GetMapping("")
	public ResponseEntity getAll() {
		var list = repositories.GetAll();

		return ResponseEntity.ok(list);
	}

	@GetMapping("/{id}")
	public ResponseEntity getById(@PathVariable Integer id) {
		var product = repositories.GetById(id);

		if (product == null) {
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

		var products = ((ProductRepository) repositories).GetByShopId(shopId);

		return ResponseEntity.ok(products);
	}

	@GetMapping("/shop/{shopId}/categories")
	public ResponseEntity<?> getCategoriesByShop(@PathVariable int shopId) {

		var categories = ((ProductRepository) repositories).getCategoriesByShop(shopId);

		return ResponseEntity.ok(categories);
	}
}

//
