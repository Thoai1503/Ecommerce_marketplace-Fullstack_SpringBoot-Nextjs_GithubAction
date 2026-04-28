package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherScopeRule;
import docker_test.com.repository.VoucherScopeRuleRepository;

@RestController
@RequestMapping("/api/voucher-scope-rules")
public class VoucherScopeRuleController {

	private final VoucherScopeRuleRepository repo = VoucherScopeRuleRepository.Instance();

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherScopeRule rule) {
		try {
			VoucherScopeRule result = repo.Create(rule);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherScopeRule rule) {
		try {
			rule.setId((long) id);
			VoucherScopeRule updated = repo.Update(rule);

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

	// ================= DELETE BY VOUCHER ID =================
	@DeleteMapping("/voucher/{voucherId}")
	public ResponseEntity<?> deleteByVoucherId(@PathVariable Long voucherId) {
		try {
			repo.deleteByVoucherId(voucherId);
			return ResponseEntity.ok("Deleted");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET BY ID =================
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		try {
			VoucherScopeRule rule = repo.GetById(id);

			if (rule == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(rule);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET ALL =================
	@GetMapping
	public ResponseEntity<?> getAll() {
		try {
			List<VoucherScopeRule> list = repo.GetAll();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET BY VOUCHER ID =================
	@GetMapping("/voucher/{voucherId}")
	public ResponseEntity<?> getByVoucherId(@PathVariable Long voucherId) {
		try {
			List<VoucherScopeRule> list = repo.getByVoucherId(voucherId);
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}