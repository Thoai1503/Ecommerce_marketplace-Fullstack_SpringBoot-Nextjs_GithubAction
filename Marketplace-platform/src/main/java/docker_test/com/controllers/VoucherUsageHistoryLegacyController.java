package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherUsageHistoryLegacy;
import docker_test.com.repository.VoucherUsageHistoryLegacyRepository;

@RestController
@RequestMapping("/api/voucher-usage-legacy")
public class VoucherUsageHistoryLegacyController {

	private final VoucherUsageHistoryLegacyRepository repo = VoucherUsageHistoryLegacyRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherUsageHistoryLegacy v) {
		try {
			return ResponseEntity.ok(repo.Create(v));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		VoucherUsageHistoryLegacy v = repo.GetById(id);
		return v == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(v);
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		return ResponseEntity.ok(repo.GetAll());
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<?> getByUser(@PathVariable Long userId) {
		List<VoucherUsageHistoryLegacy> list = repo.getByUserId(userId);
		return ResponseEntity.ok(list);
	}
}