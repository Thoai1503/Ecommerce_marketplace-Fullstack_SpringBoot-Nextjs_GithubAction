package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherRedemption;
import docker_test.com.repository.VoucherRedemptionRepository;

@RestController
@RequestMapping("/api/voucher-redemptions")
public class VoucherRedemptionController {

	private final VoucherRedemptionRepository repo = VoucherRedemptionRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherRedemption v) {
		try {
			return ResponseEntity.ok(repo.Create(v));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody VoucherRedemption v) {
		try {
			v.setId((long) id);
			VoucherRedemption updated = repo.Update(v);

			return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);

		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		VoucherRedemption v = repo.GetById(id);
		return v == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(v);
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		return ResponseEntity.ok(repo.GetAll());
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<?> getByUser(@PathVariable Long userId) {
		List<VoucherRedemption> list = repo.getByUserId(userId);
		return ResponseEntity.ok(list);
	}
}