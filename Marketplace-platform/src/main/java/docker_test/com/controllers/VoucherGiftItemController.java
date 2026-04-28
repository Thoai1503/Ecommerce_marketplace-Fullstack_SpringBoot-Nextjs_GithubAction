package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherGiftItem;
import docker_test.com.repository.VoucherGiftItemRepository;

@RestController
@RequestMapping("/api/voucher-gift-items")
public class VoucherGiftItemController {

	private final VoucherGiftItemRepository repo = VoucherGiftItemRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherGiftItem v) {
		try {
			return ResponseEntity.ok(repo.Create(v));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherGiftItem v) {
		try {
			v.setId((long) id);
			VoucherGiftItem updated = repo.Update(v);
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
		VoucherGiftItem v = repo.GetById(id);
		return v == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(v);
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		return ResponseEntity.ok(repo.GetAll());
	}

	@GetMapping("/voucher/{voucherId}")
	public ResponseEntity<?> getByVoucherId(@PathVariable Long voucherId) {
		return ResponseEntity.ok(repo.getByVoucherId(voucherId));
	}
}