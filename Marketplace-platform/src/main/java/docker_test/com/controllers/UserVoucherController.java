package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.UserVoucher;
import docker_test.com.repository.UserVoucherRepository;

@RestController
@RequestMapping("/api/user-vouchers")
public class UserVoucherController {

	private final UserVoucherRepository repo = UserVoucherRepository.Instance();

	@PostMapping
	public ResponseEntity<?> claim(@RequestBody UserVoucher u) {
		try {
			return ResponseEntity.ok(repo.Create(u));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody UserVoucher u) {
		try {
			u.setId((long) id);
			UserVoucher updated = repo.Update(u);
			return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		UserVoucher u = repo.GetById(id);
		return u == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(u);
	}

	@GetMapping
	public ResponseEntity<?> getAll() {
		return ResponseEntity.ok(repo.GetAll());
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<?> getByUser(@PathVariable Long userId) {
		List<UserVoucher> list = repo.getByUserId(userId);
		return ResponseEntity.ok(list);
	}
}