package docker_test.com.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.repository.ProductRepository;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
	private final ProductRepository productRepository;

	public AdminProductController() {
		this.productRepository = ProductRepository.Instance();
	}

	@GetMapping("")
	public ResponseEntity<?> getAll(
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) Integer isActive,
			@RequestParam(required = false) Integer shopId) {
		return ResponseEntity.ok(productRepository.GetAdminProducts(keyword, isActive, shopId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {
		Map<String, Object> product = productRepository.GetAdminProductDetail(id);
		return product == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(product);
	}

	@PutMapping("/{id}/approve")
	public ResponseEntity<?> approve(@PathVariable int id) {
		if (!productRepository.UpdateAdminProductActive(id, true, null)) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(productRepository.GetAdminProductDetail(id));
	}

	@PutMapping("/{id}/reject")
	public ResponseEntity<?> reject(
			@PathVariable int id,
			@RequestBody(required = false) Map<String, Object> payload) {
		String reason = getText(payload, "reason");
		if (!productRepository.UpdateAdminProductActive(id, false, reason)) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(productRepository.GetAdminProductDetail(id));
	}

	@PatchMapping("/{id}/active")
	public ResponseEntity<?> updateActive(
			@PathVariable int id,
			@RequestBody(required = false) Map<String, Object> payload) {
		Boolean isActive = getBoolean(payload, "isActive");
		if (isActive == null) {
			isActive = getBoolean(payload, "is_active");
		}

		if (isActive == null) {
			return ResponseEntity.badRequest().body("Missing is_active");
		}

		if (!productRepository.UpdateAdminProductActive(id, isActive, getText(payload, "reason"))) {
			return ResponseEntity.badRequest().body("Unable to update product active state");
		}

		return ResponseEntity.ok(productRepository.GetAdminProductDetail(id));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> hide(@PathVariable int id) {
		if (!productRepository.UpdateAdminProductActive(id, false, null)) {
			return ResponseEntity.notFound().build();
		}

		return ResponseEntity.ok(productRepository.GetAdminProductDetail(id));
	}

	private String getText(Map<String, Object> payload, String key) {
		if (payload == null || payload.get(key) == null) {
			return null;
		}

		String value = String.valueOf(payload.get(key)).trim();
		return value.isEmpty() ? null : value;
	}

	private Boolean getBoolean(Map<String, Object> payload, String key) {
		if (payload == null || payload.get(key) == null) {
			return null;
		}

		Object value = payload.get(key);
		if (value instanceof Boolean flag) {
			return flag;
		}

		if (value instanceof Number number) {
			return number.intValue() != 0;
		}

		String text = String.valueOf(value).trim();
		if ("1".equals(text) || "true".equalsIgnoreCase(text)) {
			return true;
		}

		if ("0".equals(text) || "false".equalsIgnoreCase(text)) {
			return false;
		}

		return null;
	}
}
