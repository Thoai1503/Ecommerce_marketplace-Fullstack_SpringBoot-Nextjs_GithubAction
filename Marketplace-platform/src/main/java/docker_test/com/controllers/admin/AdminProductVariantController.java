package docker_test.com.controllers.admin;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.ApiError;
import docker_test.com.dto.admin.ProductVariantRequestDTO;
import docker_test.com.models.product.ProductVariant;
import docker_test.com.repository.ProductVariantRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/products/{productId}/variants")
public class AdminProductVariantController {
    private final ProductVariantRepository productVariantRepository;

    public AdminProductVariantController(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    @GetMapping("")
    public ResponseEntity<?> list(@PathVariable int productId) {
        String path = "/admin/products/" + productId + "/variants";
        if (!productVariantRepository.ProductExists(productId)) {
            return notFound("PRODUCT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m.", path);
        }

        return ResponseEntity.ok(productVariantRepository.GetByProductId(productId));
    }

    @GetMapping("/{variantId}")
    public ResponseEntity<?> detail(@PathVariable int productId, @PathVariable int variantId) {
        String path = "/admin/products/" + productId + "/variants/" + variantId;
        if (!productVariantRepository.ProductExists(productId)) {
            return notFound("PRODUCT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m.", path);
        }

        ProductVariant variant = productVariantRepository.GetById(variantId);
        if (!belongsToProduct(variant, productId)) {
            return notFound("VARIANT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y bi\u1ebfn th\u1ec3 c\u1ee7a s\u1ea3n ph\u1ea9m n\u00e0y.", path);
        }

        return ResponseEntity.ok(variant);
    }

    @PostMapping("")
    public ResponseEntity<?> create(
            @PathVariable int productId,
            @Valid @RequestBody ProductVariantRequestDTO request) throws SQLException {
        String path = "/admin/products/" + productId + "/variants";
        if (!productVariantRepository.ProductExists(productId)) {
            return notFound("PRODUCT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m.", path);
        }

        ProductVariant created = productVariantRepository.Create(toVariant(productId, request));
        if (created == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "CREATE_FAILED", "T\u1ea1o bi\u1ebfn th\u1ec3 th\u1ea5t b\u1ea1i.", path));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{variantId}")
    public ResponseEntity<?> update(
            @PathVariable int productId,
            @PathVariable int variantId,
            @Valid @RequestBody ProductVariantRequestDTO request) {
        String path = "/admin/products/" + productId + "/variants/" + variantId;
        if (!productVariantRepository.ProductExists(productId)) {
            return notFound("PRODUCT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m.", path);
        }

        ProductVariant existing = productVariantRepository.GetById(variantId);
        if (!belongsToProduct(existing, productId)) {
            return notFound("VARIANT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y bi\u1ebfn th\u1ec3 c\u1ee7a s\u1ea3n ph\u1ea9m n\u00e0y.", path);
        }

        ProductVariant next = toVariant(productId, request);
        next.setVariant_id(variantId);
        next.setActive(existing.isActive());

        ProductVariant updated = productVariantRepository.Update(next);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "UPDATE_FAILED", "C\u1eadp nh\u1eadt bi\u1ebfn th\u1ec3 th\u1ea5t b\u1ea1i.", path));
        }

        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{variantId}/toggle")
    public ResponseEntity<?> toggle(@PathVariable int productId, @PathVariable int variantId) {
        String path = "/admin/products/" + productId + "/variants/" + variantId + "/toggle";
        if (!productVariantRepository.ProductExists(productId)) {
            return notFound("PRODUCT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m.", path);
        }

        ProductVariant existing = productVariantRepository.GetById(variantId);
        if (!belongsToProduct(existing, productId)) {
            return notFound("VARIANT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y bi\u1ebfn th\u1ec3 c\u1ee7a s\u1ea3n ph\u1ea9m n\u00e0y.", path);
        }

        ProductVariant updated = productVariantRepository.ToggleActive(variantId);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "TOGGLE_FAILED", "C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i bi\u1ebfn th\u1ec3 th\u1ea5t b\u1ea1i.", path));
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<?> softDelete(@PathVariable int productId, @PathVariable int variantId) {
        String path = "/admin/products/" + productId + "/variants/" + variantId;
        if (!productVariantRepository.ProductExists(productId)) {
            return notFound("PRODUCT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m.", path);
        }

        ProductVariant existing = productVariantRepository.GetById(variantId);
        if (!belongsToProduct(existing, productId)) {
            return notFound("VARIANT_NOT_FOUND", "Kh\u00f4ng t\u00ecm th\u1ea5y bi\u1ebfn th\u1ec3 c\u1ee7a s\u1ea3n ph\u1ea9m n\u00e0y.", path);
        }

        boolean deleted = productVariantRepository.Delete(variantId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(apiError(HttpStatus.BAD_REQUEST, "DELETE_FAILED", "X\u00f3a m\u1ec1m bi\u1ebfn th\u1ec3 th\u1ea5t b\u1ea1i.", path));
        }

        return ResponseEntity.ok(Map.of("deleted", true));
    }

    private ProductVariant toVariant(int productId, ProductVariantRequestDTO request) {
        ProductVariant variant = new ProductVariant();
        variant.setProduct_id(productId);
        variant.setVariant_name(request.getVariant_name());
        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice().doubleValue());
        variant.setStock_quantity(request.getStock_quantity());
        variant.setImage_url(request.getImage_url());
        variant.setWeight(request.getWeight());
        variant.setLength(request.getLength());
        variant.setWidth(request.getWidth());
        variant.setHeight(request.getHeight());
        return variant;
    }

    private boolean belongsToProduct(ProductVariant variant, int productId) {
        return variant != null && variant.getProduct_id() == productId;
    }

    private ResponseEntity<ApiError> notFound(String error, String message, String path) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(apiError(HttpStatus.NOT_FOUND, error, message, path));
    }

    private ApiError apiError(HttpStatus status, String error, String message, String path) {
        return new ApiError(status.value(), error, message, path);
    }
}
