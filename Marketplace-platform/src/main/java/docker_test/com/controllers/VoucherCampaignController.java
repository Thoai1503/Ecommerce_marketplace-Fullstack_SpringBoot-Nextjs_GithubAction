package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.voucher.VoucherCampaign;
import docker_test.com.repository.VoucherCampaignRepository;

@RestController
@RequestMapping("/api/vouchercampaigns")
public class VoucherCampaignController {

	private final VoucherCampaignRepository repo = VoucherCampaignRepository.Instance();

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody VoucherCampaign v) {
		try {
			VoucherCampaign result = repo.Create(v);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody VoucherCampaign v) {
		try {
			v.setId(id);
			VoucherCampaign updated = repo.Update(v);

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
			VoucherCampaign v = repo.GetById(id);

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
			List<VoucherCampaign> list = repo.GetAll();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// ================= GET BY CODE =================
	@GetMapping("/code/{code}")
	public ResponseEntity<?> getByCode(@PathVariable String code) {
		try {
			VoucherCampaign v = repo.getByCode(code);

			if (v == null) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(v);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}