package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherScopeRule;
import docker_test.com.repository.VoucherScopeRuleRepository;
import docker_test.com.utils.VoucherAuthorization;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/voucher-scope-rules")
public class VoucherScopeRuleController {

	private final VoucherScopeRuleRepository repo = VoucherScopeRuleRepository.Instance();

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherScopeRule rule, HttpServletRequest request) {
		try {
			if (!VoucherAuthorization.canManageVoucher(
					rule.getVoucherId(),
					VoucherAuthorization.getAuthUser(request))) {
				return ResponseEntity.status(403).body("You do not have permission to create rules for this voucher");
			}

			VoucherScopeRule result = repo.Create(rule);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherScopeRule rule, HttpServletRequest request) {
		try {
			VoucherScopeRule existing = repo.GetById(id);

			if (existing == null) {
				return ResponseEntity.notFound().build();
			}

			if (!VoucherAuthorization.canManageVoucher(
					existing.getVoucherId(),
					VoucherAuthorization.getAuthUser(request))) {
				return ResponseEntity.status(403).body("You do not have permission to update rules for this voucher");
			}

			rule.setId((long) id);
			rule.setVoucherId(existing.getVoucherId());
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
	public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
		try {
			VoucherScopeRule existing = repo.GetById(id);

			if (existing == null) {
				return ResponseEntity.notFound().build();
			}

			if (!VoucherAuthorization.canManageVoucher(
					existing.getVoucherId(),
					VoucherAuthorization.getAuthUser(request))) {
				return ResponseEntity.status(403).body("You do not have permission to delete rules for this voucher");
			}

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
	public ResponseEntity<?> deleteByVoucherId(@PathVariable Long voucherId, HttpServletRequest request) {
		try {
			if (!VoucherAuthorization.canManageVoucher(
					voucherId,
					VoucherAuthorization.getAuthUser(request))) {
				return ResponseEntity.status(403).body("You do not have permission to delete rules for this voucher");
			}

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
