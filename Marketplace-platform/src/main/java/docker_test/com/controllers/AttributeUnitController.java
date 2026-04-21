package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.attribute.AttributeUnit;
import docker_test.com.repository.AttributeUnitRepository;

@RestController
@RequestMapping("/api/attribute-unit")
public class AttributeUnitController {
  //attribute unit controller
	private final AttributeUnitRepository repository = AttributeUnitRepository.Instance();

	// ===== GET ALL =====
	@GetMapping
	public ResponseEntity<List<AttributeUnit>> getAll() {
		return ResponseEntity.ok(repository.GetAll());
	}

	// ===== GET BY ID =====
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		AttributeUnit item = repository.GetById(id);
		if (item == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}
		return ResponseEntity.ok(item);
	}

	// ===== GET BY ATTRIBUTE =====
	@GetMapping("/attribute/{attributeId}")
	public ResponseEntity<List<AttributeUnit>> getByAttribute(@PathVariable int attributeId) {
		return ResponseEntity.ok(repository.GetByAttributeId(attributeId));
	}

	// ===== CREATE =====
	@PostMapping
	public ResponseEntity<?> create(@RequestBody AttributeUnit item) {
		try {
			if (item.getAttribute_id() <= 0 || item.getUnit_id() <= 0) {
				return ResponseEntity.badRequest().body("Invalid data");
			}

			item.setStatus(1);

			AttributeUnit saved = repository.Create(item);
			return ResponseEntity.status(HttpStatus.CREATED).body(saved);

		} catch (SQLException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create failed: " + e.getMessage());
		}
	}

	// ===== UPDATE =====
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody AttributeUnit item) {

		item.setId(id);

		boolean updated = repository.Update(item);

		if (!updated) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		return ResponseEntity.ok("Updated successfully");
	}

	// ===== DELETE =====
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {

		boolean deleted = repository.Delete(id);

		if (!deleted) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
		}

		return ResponseEntity.ok("Deleted successfully");
	}
}