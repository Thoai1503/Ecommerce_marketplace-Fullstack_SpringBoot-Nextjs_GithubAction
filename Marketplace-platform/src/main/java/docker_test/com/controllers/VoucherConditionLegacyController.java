package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherConditionLegacy;
import docker_test.com.repository.VoucherConditionLegacyRepository;

@RestController
@RequestMapping("/api/voucher-condition-legacy")
public class VoucherConditionLegacyController {

	private final VoucherConditionLegacyRepository repo = VoucherConditionLegacyRepository.Instance();

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherConditionLegacy c) {
		try {
			VoucherConditionLegacy result = repo.Create(c);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherConditionLegacy c) {
		try {
			c.setId((long) id);

			VoucherConditionLegacy updated = repo.Update(c);

			if (updated == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(updated);

		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= DELETE =================
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {
		try {
			boolean deleted = repo.Delete(id);

			if (!deleted) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok("Deleted");

		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET BY ID =================
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		try {
			VoucherConditionLegacy c = repo.GetById(id);

			if (c == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(c);

		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET ALL =================
	@GetMapping
	public ResponseEntity<?> getAll() {
		try {
			List<VoucherConditionLegacy> list = repo.GetAll();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}