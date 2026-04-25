package docker_test.com.controllers.seller;

import java.sql.SQLException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.ProductVariant;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductVariantRepository;

@RestController("/seller/product-variant")
@RequestMapping("/seller/product-variant")
@CrossOrigin(origins = "*")
public class ProductVariantController {

    private final IRepositories repositories;
    private final IRepoFactory iRepoFactory;

    public ProductVariantController(RepoFactoryImpl factoryImpl) {
        this.iRepoFactory = factoryImpl;
        this.repositories = iRepoFactory.createRepo("product_variant");
    }

    // GET /seller/product-variant/product/{id} — lấy variants theo product
    @GetMapping("/product/{id}")
    public ResponseEntity<?> getByProductId(@PathVariable int id) {
        var list = ((ProductVariantRepository) repositories).GetByProductId(id);
        return ResponseEntity.ok(list);
    }

    // GET /seller/product-variant/{id} — lấy chi tiết 1 variant
    @GetMapping("{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        var variant = repositories.GetById(id);
        if (variant == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Variant not found");
        return ResponseEntity.ok(variant);
    }

    // POST /seller/product-variant — tạo variant mới
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody ProductVariant productVariant) throws SQLException {
        if (productVariant.getProduct_id() <= 0)
            return ResponseEntity.badRequest().body("product_id is required");
        if (productVariant.getVariant_name() == null || productVariant.getVariant_name().isBlank())
            return ResponseEntity.badRequest().body("variant_name is required");
        if (productVariant.getPrice() == null || productVariant.getPrice() < 0)
            return ResponseEntity.badRequest().body("price must be >= 0");
        if (productVariant.getStock_quantity() < 0)
            return ResponseEntity.badRequest().body("stock_quantity must be >= 0");

        var created = ((ProductVariantRepository) repositories).Create(productVariant);
        if (created == null)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create variant failed");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /seller/product-variant/{id} — cập nhật variant
    @PutMapping("{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody ProductVariant req) {
        ProductVariant existing = (ProductVariant) repositories.GetById(id);
        if (existing == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Variant not found");

        // Chỉ update field nào được gửi lên (null giữ nguyên nhờ COALESCE trong SQL)
        req.setVariant_id(id);

        ProductVariant updated = ((ProductVariantRepository) repositories).Update(req);
        if (updated == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update variant failed");
        return ResponseEntity.ok(updated);
    }

    // DELETE /seller/product-variant/{id} — xóa mềm variant (is_active = 0)
    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        ProductVariant existing = (ProductVariant) repositories.GetById(id);
        if (existing == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Variant not found");

        boolean deleted = ((ProductVariantRepository) repositories).Delete(id);
        if (!deleted)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delete variant failed");
        return ResponseEntity.ok(true);
    }
}
