package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherUserSegmentRule;
import docker_test.com.repository.VoucherUserSegmentRuleRepository;
import docker_test.com.utils.VoucherAuthorization;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/voucher-segment-rules")
public class VoucherUserSegmentRuleController {

	private final VoucherUserSegmentRuleRepository repo = VoucherUserSegmentRuleRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherUserSegmentRule rule, HttpServletRequest request) {
		try {
			if (!VoucherAuthorization.canManageVoucher(
					rule.getVoucherId(),
					VoucherAuthorization.getAuthUser(request))) {
				return ResponseEntity.status(403).body("You do not have permission to create rules for this voucher");
			}

			return ResponseEntity.ok(repo.Create(rule));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherUserSegmentRule rule, HttpServletRequest request) {
		try {
			VoucherUserSegmentRule existing = repo.GetById(id);

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
			VoucherUserSegmentRule updated = repo.Update(rule);
			return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
		VoucherUserSegmentRule existing = repo.GetById(id);

		if (existing == null) {
			return ResponseEntity.notFound().build();
		}

		if (!VoucherAuthorization.canManageVoucher(
				existing.getVoucherId(),
				VoucherAuthorization.getAuthUser(request))) {
			return ResponseEntity.status(403).body("You do not have permission to delete rules for this voucher");
		}

		return repo.Delete(id) ? ResponseEntity.ok("Deleted") : ResponseEntity.notFound().build();
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		VoucherUserSegmentRule v = repo.GetById(id);
		return v == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(v);
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		List<VoucherUserSegmentRule> list = repo.GetAll();
		return ResponseEntity.ok(list);
	}

	@GetMapping("/voucher/{voucherId}")
	public ResponseEntity<?> getByVoucherId(@PathVariable Long voucherId) {
		return ResponseEntity.ok(repo.getByVoucherId(voucherId));
	}
}
