package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherUserSegmentRule;
import docker_test.com.repository.VoucherUserSegmentRuleRepository;

@RestController
@RequestMapping("/api/voucher-segment-rules")
public class VoucherUserSegmentRuleController {

	private final VoucherUserSegmentRuleRepository repo = VoucherUserSegmentRuleRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherUserSegmentRule rule) {
		try {
			return ResponseEntity.ok(repo.Create(rule));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherUserSegmentRule rule) {
		try {
			rule.setId((long) id);
			VoucherUserSegmentRule updated = repo.Update(rule);
			return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {
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