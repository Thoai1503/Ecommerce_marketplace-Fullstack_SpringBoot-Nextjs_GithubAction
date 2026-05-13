package docker_test.com.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.Wishlist;
import docker_test.com.repository.WishlistRepository;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository = WishlistRepository.Instance();

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable long userId) {
        if (userId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid userId");
        }

        return ResponseEntity.ok(wishlistRepository.GetByUserId(userId));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(
            @RequestParam("user_id") long userId,
            @RequestParam("product_id") long productId) {
        if (userId <= 0 || productId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid user_id/product_id");
        }

        return ResponseEntity.ok(buildResponse(userId, productId));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Map<String, Object> payload) {
        long userId = getPayloadLong(payload, "user_id", getPayloadLong(payload, "userId", 0L));
        long productId = getPayloadLong(payload, "product_id", getPayloadLong(payload, "productId", 0L));

        if (userId <= 0 || productId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid user_id/product_id");
        }

        if (!wishlistRepository.ProductExists(productId)) {
            return ResponseEntity.notFound().build();
        }

        if (wishlistRepository.IsOwnProduct(userId, productId)) {
            return ResponseEntity.badRequest().body("Cannot add your own product to wishlist");
        }

        Wishlist wishlist = wishlistRepository.Add(userId, productId);
        if (wishlist == null) {
            return ResponseEntity.status(500).body("Unable to add product to wishlist");
        }

        return ResponseEntity.ok(buildResponse(userId, productId));
    }

    @DeleteMapping
    public ResponseEntity<?> remove(
            @RequestParam("user_id") long userId,
            @RequestParam("product_id") long productId) {
        if (userId <= 0 || productId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid user_id/product_id");
        }

        wishlistRepository.Remove(userId, productId);
        return ResponseEntity.ok(buildResponse(userId, productId));
    }

    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<?> removeByPath(
            @PathVariable long userId,
            @PathVariable long productId) {
        if (userId <= 0 || productId <= 0) {
            return ResponseEntity.badRequest().body("Missing or invalid userId/productId");
        }

        wishlistRepository.Remove(userId, productId);
        return ResponseEntity.ok(buildResponse(userId, productId));
    }

    private Map<String, Object> buildResponse(long userId, long productId) {
        boolean isWishlisted = wishlistRepository.Exists(userId, productId);
        int count = wishlistRepository.CountByUser(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("user_id", userId);
        response.put("productId", productId);
        response.put("product_id", productId);
        response.put("isWishlisted", isWishlisted);
        response.put("is_wishlisted", isWishlisted);
        response.put("count", count);
        response.put("wishlist_count", count);
        return response;
    }

    private long getPayloadLong(Map<String, Object> payload, String key, long fallback) {
        if (payload == null || !payload.containsKey(key)) {
            return fallback;
        }

        Object value = payload.get(key);
        if (value == null) {
            return fallback;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }
}
