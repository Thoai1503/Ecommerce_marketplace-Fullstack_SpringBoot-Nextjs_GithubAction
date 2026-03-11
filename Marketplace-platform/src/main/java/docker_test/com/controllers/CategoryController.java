package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.Category;
import docker_test.com.repository.IRepositories;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

	private final IRepositories<Category> repositories;

	public CategoryController() {
		repositories = RepoFactoryImpl.Instance().createRepo("category");
	}

	/* ================= GET ALL ================= */
	// GET http://localhost:8000/api/categories
	@GetMapping("")
	public ResponseEntity<List<Category>> getAll() {

		List<Category> list = repositories.GetAll();

		return ResponseEntity.ok(list);
	}

	/* ================= GET BY ID ================= */
	// GET http://localhost:8000/api/categories/{id}
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {

		Category item = repositories.GetById(id);

		if (item == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
		}

		return ResponseEntity.ok(item);
	}

	/* ================= CREATE ================= */
	// POST http://localhost:8000/api/categories
	@PostMapping("")
	public ResponseEntity<?> create(@RequestBody Category item) {

		try {

			if (item.getCategory_name() == null || item.getCategory_name().isBlank()) {
				return ResponseEntity.badRequest().body("Category name cannot be empty");
			}

			// default values
			if (item.getParent_id() == null) {
				item.setParent_id(0);
			}

			if (item.getLevel() == null) {
				item.setLevel(0);
			}

			if (item.getIs_active() == null) {
				item.setIs_active(1);
			}

			Category created = repositories.Create(item);

			return ResponseEntity.status(HttpStatus.CREATED).body(created);

		} catch (SQLException e) {

			e.printStackTrace();

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create category failed");
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(
	        @PathVariable int id,
	        @RequestBody Category req
	) {

	    Category existing = repositories.GetById(id);

	    if (existing == null) {
	        return ResponseEntity
	                .status(HttpStatus.NOT_FOUND)
	                .body("Category not found");
	    }

	    // đảm bảo id đúng
	    existing.setId(id);

	    if (req.getCategory_name() != null) {
	        existing.setCategory_name(req.getCategory_name());
	    }

	    if (req.getCategory_slug() != null) {
	        existing.setCategory_slug(req.getCategory_slug());
	    }

	    if (req.getCategory_icon() != null) {
	        existing.setCategory_icon(req.getCategory_icon());
	    }

	    if (req.getLevel() != null) {
	        existing.setLevel(req.getLevel());
	    }

	    if (req.getIs_active() != null) {
	        existing.setIs_active(req.getIs_active());
	    }

	    if (req.getParent_id() != null) {
	        existing.setParent_id(req.getParent_id());
	    }

	    Category updated = repositories.Update(existing);

	    if (updated == null) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Update failed");
	    }

	    return ResponseEntity.ok(updated);
	}

	/* ================= DELETE ================= */
	// DELETE http://localhost:8000/api/categories/{id}
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {

		boolean deleted = repositories.Delete(id);

		if (!deleted) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
		}

		return ResponseEntity.ok("Deleted successfully");
	}
}