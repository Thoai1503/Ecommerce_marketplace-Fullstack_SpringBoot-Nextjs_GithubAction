package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.CategoryBrand;
import docker_test.com.repository.CategoryBrandRepository;
import docker_test.com.repository.IRepositories;

@RestController
@RequestMapping("/api/category-brand")
public class CategoryBrandController {

	private final IRepositories<CategoryBrand> repo;

	public CategoryBrandController() {
		repo = RepoFactoryImpl.Instance().createRepo("category_brand");
	}

	// ===== GET ALL =====
	@GetMapping
	public ResponseEntity<List<CategoryBrand>> getAll() {
		return ResponseEntity.ok(repo.GetAll());
	}

	// ===== GET BY ID =====
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		CategoryBrand item = repo.GetById(id);

		if (item == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		return ResponseEntity.ok(item);
	}

	// ===== CREATE =====
	@PostMapping
	public ResponseEntity<?> create(@RequestBody CategoryBrand item) {
		try {
			if (item.getCategory_id() == 0 || item.getBrand_id() == 0) {
				return ResponseEntity.badRequest().body("category_id & brand_id required");
			}

			if (item.getStatus() == null) {
				item.setStatus(1);
			}

			CategoryBrand created = repo.Create(item);

			return ResponseEntity.status(HttpStatus.CREATED).body(created);

		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create failed: " + e.getMessage());
		}
	}

	// ===== UPDATE =====
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody CategoryBrand req) {

		CategoryBrand existing = repo.GetById(id);

		if (existing == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		existing.setId(id);

		if (req.getCategory_id() != 0)
			existing.setCategory_id(req.getCategory_id());

		if (req.getBrand_id() != 0)
			existing.setBrand_id(req.getBrand_id());

		if (req.getStatus() != null)
			existing.setStatus(req.getStatus());

		CategoryBrand updated = repo.Update(existing);

		if (updated == null) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed");
		}

		return ResponseEntity.ok(updated);
	}

	// ===== DELETE =====
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {
		boolean deleted = repo.Delete(id);

		if (!deleted) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		return ResponseEntity.ok("Deleted");
	}

	// ===== TOGGLE STATUS =====
	@PatchMapping("/{id}/toggle")
	public ResponseEntity<?> toggle(@PathVariable int id) {

		CategoryBrandRepository repoImpl = CategoryBrandRepository.Instance();

		boolean ok = repoImpl.ToggleStatus(id);

		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Toggle failed");
		}

		return ResponseEntity.ok("Status toggled");
	}

	@GetMapping("/category/{categoryId}")
	public ResponseEntity<List<CategoryBrand>> getByCategory(@PathVariable int categoryId) {
		CategoryBrandRepository repoImpl = CategoryBrandRepository.Instance();
		return ResponseEntity.ok(repoImpl.GetByCategoryId(categoryId));
	}
}