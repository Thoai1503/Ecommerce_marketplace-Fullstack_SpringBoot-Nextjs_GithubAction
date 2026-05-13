package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.voucher.VoucherRedemption;
import docker_test.com.models.voucher.VoucherRedemptionItem;
import docker_test.com.repository.VoucherRedemptionItemRepository;
import docker_test.com.repository.VoucherRedemptionRepository;

@RestController
@RequestMapping("/api/voucher-redemptions")
public class VoucherRedemptionController {

	private final VoucherRedemptionRepository repo = VoucherRedemptionRepository.Instance();
	private final VoucherRedemptionItemRepository itemRepo = VoucherRedemptionItemRepository.Instance();

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

	@PostMapping("/items")
	public ResponseEntity<?> createItem(@RequestBody VoucherRedemptionItem item) {
		try {
			return ResponseEntity.ok(itemRepo.Create(item));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/{redemptionId}/items")
	public ResponseEntity<?> getItemsByRedemption(@PathVariable Long redemptionId) {
		return ResponseEntity.ok(itemRepo.getByRedemptionId(redemptionId));
	}

	@GetMapping("/order/{orderId}/items")
	public ResponseEntity<?> getItemsByOrder(@PathVariable Long orderId) {
		return ResponseEntity.ok(itemRepo.getByOrderId(orderId));
	}
}
