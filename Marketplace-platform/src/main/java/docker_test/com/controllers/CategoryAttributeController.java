package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.dto.CategoryAttributeBulkRequest;
import docker_test.com.models.CategoryAttribute;
import docker_test.com.repository.CategoryAttributeRepository;

@RestController
@RequestMapping("/api/category-attribute")
public class CategoryAttributeController {

	private final CategoryAttributeRepository repository;

	public CategoryAttributeController() {
		this.repository = CategoryAttributeRepository.Instance();
	}

	// ================= GET ALL =================
	@GetMapping
	public ResponseEntity<List<CategoryAttribute>> getAll() {
		return ResponseEntity.ok(repository.GetAll());
	}

	// ================= GET BY ID =================
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		CategoryAttribute ca = repository.GetById(id);

		if (ca == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		return ResponseEntity.ok(ca);
	}

	// ================= GET BY CATEGORY =================
	@GetMapping("/category/{categoryId}")
	public ResponseEntity<List<CategoryAttribute>> getByCategory(@PathVariable long categoryId) {
		return ResponseEntity.ok(repository.GetByCategoryId(categoryId));
	}

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody CategoryAttribute item) {
		try {
			if (item.getCategoryId() <= 0 || item.getAttributeId() <= 0) {
				return ResponseEntity.badRequest().body("Invalid data");
			}

			CategoryAttribute saved = repository.Create(item);
			return ResponseEntity.status(HttpStatus.CREATED).body(saved);

		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create failed: " + e.getMessage());
		}
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody CategoryAttribute item) {
		try {
			CategoryAttribute existing = repository.GetById(id);

			if (existing == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
			}

			item.setId(id);
			CategoryAttribute updated = repository.Update(item);

			return ResponseEntity.ok(updated);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed: " + e.getMessage());
		}
	}

	// ================= DELETE =================
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {

		boolean deleted = repository.Delete(id);

		if (!deleted) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		return ResponseEntity.ok("Deleted successfully");
	}

	@PostMapping("/bulk")
	public ResponseEntity<?> createBulk(@RequestBody CategoryAttributeBulkRequest req) {
		try {
			if (req.getCategoryId() <= 0 || req.getAttributeIds() == null || req.getAttributeIds().isEmpty()) {
				return ResponseEntity.badRequest().body("Invalid data");
			}

			for (Long attrId : req.getAttributeIds()) {

				// 🔥 check duplicate
				boolean exists = repository.Exists(req.getCategoryId(), attrId);
				if (exists)
					continue;

				CategoryAttribute item = new CategoryAttribute();
				item.setCategoryId(req.getCategoryId());
				item.setAttributeId(attrId.intValue()); 
				item.setStatus(1);

				repository.Create(item);
			}

			return ResponseEntity.ok("Bulk insert success");

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Bulk create failed: " + e.getMessage());
		}
	}
}