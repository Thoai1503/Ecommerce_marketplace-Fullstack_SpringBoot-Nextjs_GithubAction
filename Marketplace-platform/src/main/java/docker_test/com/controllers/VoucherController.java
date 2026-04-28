package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.voucher.Voucher;
import docker_test.com.repository.VoucherRepository;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {
	private final VoucherRepository repo = VoucherRepository.Instance();

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody Voucher v) {
		try {
			Voucher result = repo.Create(v);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody Voucher v) {
		try {
			v.setId((long) id);
			Voucher updated = repo.Update(v);

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

	// ================= GET BY ID =================
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		try {
			Voucher v = repo.GetById(id);

			if (v == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(v);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET ALL =================
	@GetMapping
	public ResponseEntity<?> getAll() {
		try {
			List<Voucher> list = repo.GetAll();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET BY CODE =================
	@GetMapping("/code/{code}")
	public ResponseEntity<?> getByCode(@PathVariable String code) {
		try {
			Voucher v = repo.getByCode(code);

			if (v == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(v);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}
