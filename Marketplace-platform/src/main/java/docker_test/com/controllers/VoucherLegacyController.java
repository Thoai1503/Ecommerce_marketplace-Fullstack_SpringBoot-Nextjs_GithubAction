package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherLegacy;
import docker_test.com.repository.VoucherLegacyRepository;

@RestController
@RequestMapping("/api/voucher-legacy")
public class VoucherLegacyController {

	private final VoucherLegacyRepository repo = VoucherLegacyRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherLegacy v) {
		try {
			VoucherLegacy result = repo.Create(v);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherLegacy v) {
		try {
			v.setId((long) id);

			VoucherLegacy updated = repo.Update(v);

			if (updated == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(updated);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

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

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		try {
			VoucherLegacy v = repo.GetById(id);

			if (v == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(v);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		try {
			List<VoucherLegacy> list = repo.GetAll();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<?> getByCode(@PathVariable String code) {
		try {
			VoucherLegacy v = repo.getByCode(code);

			if (v == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(v);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/shop/{shopId}")
	public ResponseEntity<?> getByShopId(@PathVariable Long shopId) {
		try {
			List<VoucherLegacy> list = repo.getByShopId(shopId);
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}