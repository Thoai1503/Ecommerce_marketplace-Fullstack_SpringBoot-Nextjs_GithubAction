package docker_test.com.controllers.admin;

import docker_test.com.models.product.Product;
import docker_test.com.repository.ProductRepository;
import docker_test.com.repository.ProductStatsRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ProductStatsController {
    private final ProductRepository productRepository = ProductRepository.Instance();
    private final ProductStatsRepository statsRepository = ProductStatsRepository.Instance();

    @GetMapping("/admin/products/{id}/stats")
    public ResponseEntity<?> stats(@PathVariable int id, @RequestParam(defaultValue = "30") int days) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        int safeDays = switch (days) {
            case 7, 30, 90, 365 -> days;
            default -> 30;
        };
        return ResponseEntity.ok(Map.of("data", statsRepository.getStats(id, safeDays)));
    }

    @PostMapping("/products/{id}/view")
    public ResponseEntity<?> recordView(
            @PathVariable int id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest request
    ) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        statsRepository.recordView(id, userId, request.getRemoteAddr(), userAgent);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
