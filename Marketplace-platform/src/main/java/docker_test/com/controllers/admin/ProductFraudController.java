package docker_test.com.controllers.admin;

import docker_test.com.dto.FraudCheckResult;
import docker_test.com.models.product.Product;
import docker_test.com.repository.ProductRepository;
import docker_test.com.services.FraudDetectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ProductFraudController {
    private final ProductRepository productRepository = ProductRepository.Instance();
    private final FraudDetectionService fraudDetectionService;

    public ProductFraudController(FraudDetectionService fraudDetectionService) {
        this.fraudDetectionService = fraudDetectionService;
    }

    @GetMapping("{id}/fraud-check")
    public ResponseEntity<?> latest(@PathVariable int id) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        FraudCheckResult result = fraudDetectionService.analyzeProduct(id, false);
        return ResponseEntity.ok(Map.of("data", result));
    }

    @PostMapping("{id}/fraud-check")
    public ResponseEntity<?> rerun(@PathVariable int id) {
        Product product = productRepository.GetById(id);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        FraudCheckResult result = fraudDetectionService.analyzeProduct(id, true);
        return ResponseEntity.ok(Map.of("data", result));
    }
}
