package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherAuditLog;
import docker_test.com.repository.VoucherAuditLogRepository;

@RestController
@RequestMapping("/api/voucher-audit-logs")
public class VoucherAuditLogController {

	private final VoucherAuditLogRepository repo = VoucherAuditLogRepository.Instance();

	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherAuditLog log) {
		try {
			VoucherAuditLog result = repo.Create(log);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherAuditLog log) {
		try {
			log.setId((long) id);

			VoucherAuditLog updated = repo.Update(log);

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
			VoucherAuditLog log = repo.GetById(id);

			if (log == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(log);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		try {
			List<VoucherAuditLog> list = repo.GetAll();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/voucher/{voucherId}")
	public ResponseEntity<?> getByVoucherId(@PathVariable Long voucherId) {
		try {
			List<VoucherAuditLog> list = repo.getByVoucherId(voucherId);
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/event/{eventType}")
	public ResponseEntity<?> getByEventType(@PathVariable String eventType) {
		try {
			List<VoucherAuditLog> list = repo.getByEventType(eventType);
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}