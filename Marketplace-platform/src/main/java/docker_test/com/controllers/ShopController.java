package docker_test.com.controllers;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.Shop;
import docker_test.com.repository.ShopRepository;

@RestController
@RequestMapping("/shops")
public class ShopController {

	private ShopRepository shopRepository;

	public ShopController() {
		this.shopRepository = ShopRepository.Instance();
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	private boolean isCompleteShop(Shop shop) {
		return shop != null
				&& hasText(shop.getOwner_name())
				&& hasText(shop.getBusiness_license())
				&& hasText(shop.getTax_code())
				&& hasText(shop.getUrl_card_front())
				&& hasText(shop.getUrl_card_back());
	}

	private int clampOnboardingStep(Integer step) {
		if (step == null) {
			return 1;
		}

		return Math.max(1, Math.min(4, step));
	}

	private int inferOnboardingStep(Shop shop) {
		if (isCompleteShop(shop)) {
			return 4;
		}

		if (shop != null
				&& hasText(shop.getOwner_name())
				&& hasText(shop.getBusiness_license())
				&& hasText(shop.getUrl_card_front())
				&& hasText(shop.getUrl_card_back())) {
			return 3;
		}

		if (shop != null && (shop.getId() != null || hasText(shop.getShop_name()))) {
			return 2;
		}

		return 1;
	}

	private int resolveOnboardingStep(Shop shop, Integer requestedStep) {
		if (isCompleteShop(shop)) {
			return 4;
		}

		if (requestedStep == null) {
			return inferOnboardingStep(shop);
		}

		int step = clampOnboardingStep(requestedStep);
		if (step >= 4) {
			return inferOnboardingStep(shop);
		}

		return step;
	}

	private String getPayloadString(Map<String, Object> payload, String key, String fallback) {
		Object value = payload.get(key);
		return value == null ? fallback : String.valueOf(value);
	}

	private Integer getPayloadInteger(Map<String, Object> payload, String key, Integer fallback) {
		Object value = payload.get(key);
		if (value == null) {
			return fallback;
		}

		if (value instanceof Number number) {
			return number.intValue();
		}

		try {
			return Integer.parseInt(String.valueOf(value));
		} catch (NumberFormatException ex) {
			return fallback;
		}
	}

	@GetMapping("")
	public ResponseEntity<?> getAll() {
		var list = shopRepository.GetAll();
		return ResponseEntity.ok(list);
	}

	@PostMapping("")
	public ResponseEntity<?> create(@RequestBody Shop item) throws SQLException {
		if (item == null || item.getUser_id() <= 0) {
			return ResponseEntity.badRequest().body("Missing or invalid user_id");
		}

		Shop existingShop = shopRepository.GetByUserId(item.getUser_id());
		if (existingShop != null) {
			Integer requestedStep = item.getOnboarding_step();
			if (requestedStep != null) {
				int onboardingStep = resolveOnboardingStep(existingShop, requestedStep);
				shopRepository.UpdateOnboardingStep(existingShop.getId(), onboardingStep);
				existingShop.setOnboarding_step(onboardingStep);
				existingShop.setUpdated_at(LocalDateTime.now());
			}

			return ResponseEntity.ok(existingShop);
		}

		item.setOnboarding_step(resolveOnboardingStep(item, item.getOnboarding_step()));

		var result = shopRepository.Create(item);
		return ResponseEntity.ok(result);
	}

	// ✅ Check user đã có shop chưa
	@GetMapping("/check")
	public ResponseEntity<?> checkShop(@RequestParam("user_id") int userId) {
		Shop shop = shopRepository.GetByUserId(userId);

		boolean hasShop = shop != null;
		boolean isComplete = false;

		if (hasShop) {
			isComplete = isCompleteShop(shop);
		}

		Map<String, Object> response = new HashMap<>();
		response.put("hasShop", hasShop);
		response.put("isComplete", isComplete);
		response.put("shop", shop);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		var shop = shopRepository.GetById(id);

		if (shop == null) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(shop);
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateCompliance(@PathVariable int id, @RequestBody Map<String, Object> payload) {
		Shop existing = shopRepository.GetById(id);

		if (existing == null) {
			return ResponseEntity.notFound().build();
		}

		String businessLicense = getPayloadString(payload, "business_license", existing.getBusiness_license());
		String taxCode = getPayloadString(payload, "tax_code", existing.getTax_code());
		String ownerName = getPayloadString(payload, "owner_name", existing.getOwner_name());
		String urlCardFront = getPayloadString(payload, "url_card_front", existing.getUrl_card_front());
		String urlCardBack = getPayloadString(payload, "url_card_back", existing.getUrl_card_back());
		Integer onboardingStep = getPayloadInteger(payload, "onboarding_step", existing.getOnboarding_step());

		existing.setBusiness_license(businessLicense);
		existing.setTax_code(taxCode);
		existing.setOwner_name(ownerName);
		existing.setUrl_card_front(urlCardFront);
		existing.setUrl_card_back(urlCardBack);
		existing.setOnboarding_step(resolveOnboardingStep(existing, onboardingStep));
		existing.setUpdated_at(LocalDateTime.now());

		Shop updated = shopRepository.Update(existing);

		if (updated != null) {
			return ResponseEntity.ok(updated);
		}

		return ResponseEntity.status(500).body("Unable to update shop information");
	}

	@PatchMapping("/{id}/onboarding-step")
	public ResponseEntity<?> updateOnboardingStep(@PathVariable int id, @RequestBody Map<String, Object> payload) {
		Shop existing = shopRepository.GetById(id);

		if (existing == null) {
			return ResponseEntity.notFound().build();
		}

		Integer requestedStep = getPayloadInteger(payload, "onboarding_step",
				getPayloadInteger(payload, "step", existing.getOnboarding_step()));
		int onboardingStep = resolveOnboardingStep(existing, requestedStep);

		boolean updated = shopRepository.UpdateOnboardingStep(id, onboardingStep);
		if (!updated) {
			return ResponseEntity.status(500).body("Unable to update onboarding step");
		}

		existing.setOnboarding_step(onboardingStep);
		existing.setUpdated_at(LocalDateTime.now());
		return ResponseEntity.ok(existing);
	}

	@PatchMapping("/{id}/verify")
	public ResponseEntity<?> verifyShop(@PathVariable long id) {
	    boolean success = shopRepository.VerifyShopAndUpdateUser(id);

	    if (!success) {
	        return ResponseEntity.badRequest().body("The shop has been verified or does not exist.");
	    }

	    return ResponseEntity.ok("Shop verified successfully and user type updated to both.");
	}
}
