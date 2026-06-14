package docker_test.com.controllers.admin;

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
import docker_test.com.repository.NotificationRepository;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.VoucherRepository;
import docker_test.com.services.JwtService;
import docker_test.com.utils.VoucherAuthorization;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/vouchers")
public class AdminVoucherController {
	private final VoucherRepository repo = VoucherRepository.Instance();
	private final NotificationRepository notificationRepository = NotificationRepository.Instance();
	private final ShopRepository shopRepository = ShopRepository.Instance();
	private final JwtService jwtService;

	public AdminVoucherController(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	// ================= CREATE =================
	@PostMapping
	public ResponseEntity<?> create(@RequestBody Voucher v, HttpServletRequest request) {
		try {
			var authUser = VoucherAuthorization.getAuthUser(request, jwtService);
			if (!VoucherAuthorization.canManageVoucher(v, authUser)) {
				return ResponseEntity.status(403).body("You do not have permission to create this voucher");
			}

			Voucher result = repo.Create(v);
			sendVoucherCreatedNotification(result);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	private void sendVoucherCreatedNotification(Voucher voucher) {
		if (voucher == null || voucher.getId() == null) {
			return;
		}

		String issuerType = voucher.getIssuerType() == null ? "" : voucher.getIssuerType().trim().toUpperCase();
		String voucherTitle = hasText(voucher.getTitle()) ? voucher.getTitle() : voucher.getCode();

		if ("PLATFORM".equals(issuerType)) {
			notificationRepository.CreateForAllActiveUsers(
					"promotion",
					"Nexamart Got a new voucher",
					"Voucher " + voucherTitle + " It has just been released on the platform. Save your voucher before it runs out.",
					voucher.getId());
			return;
		}

		if ("SHOP".equals(issuerType) && voucher.getIssuerId() != null) {
			var shop = shopRepository.GetById(voucher.getIssuerId().intValue());
			String shopName = shop != null && hasText(shop.getShop_name()) ? shop.getShop_name() : "Shop you follow";

			notificationRepository.CreateForShopFollowers(
					voucher.getIssuerId(),
					"shop",
					shopName + " has a new voucher",
					shopName + " just created voucher " + voucherTitle + ". Go to the shop to save the voucher now.",
					voucher.getIssuerId());
		}
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	// ================= UPDATE =================
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody Voucher v, HttpServletRequest request) {
		try {
			Voucher existing = repo.GetById(id);

			if (existing == null) {
				return ResponseEntity.notFound().build();
			}

			var authUser = VoucherAuthorization.getAuthUser(request, jwtService);
			if (!VoucherAuthorization.canManageVoucher(existing, authUser)) {
				return ResponseEntity.status(403).body("You do not have permission to update this voucher");
			}

			if (!VoucherAuthorization.isAdmin(authUser)) {
				v.setIssuerType(existing.getIssuerType());
				v.setIssuerId(existing.getIssuerId());
			}

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
	public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
		try {
			Voucher existing = repo.GetById(id);

			if (existing == null) {
				return ResponseEntity.notFound().build();
			}

			var authUser = VoucherAuthorization.getAuthUser(request, jwtService);
			if (!VoucherAuthorization.canManageVoucher(existing, authUser)) {
				return ResponseEntity.status(403).body("You do not have permission to delete this voucher");
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
