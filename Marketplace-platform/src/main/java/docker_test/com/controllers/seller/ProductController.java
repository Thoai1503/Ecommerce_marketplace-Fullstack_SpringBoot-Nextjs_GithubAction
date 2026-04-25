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
import docker_test.com.models.product.Product;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductRepository;

@RestController("sellerProductController")
@RequestMapping("/seller/product")
@CrossOrigin(origins = "*")
public class ProductController {

    private final IRepositories repositories;
    private final IRepoFactory iRepoFactory;

    public ProductController(RepoFactoryImpl factoryImpl) {
        this.iRepoFactory = factoryImpl;
        this.repositories = iRepoFactory.createRepo("product");
    }

    // GET /seller/product — lấy tất cả sản phẩm kèm variants
    @GetMapping("")
    public ResponseEntity<?> getAll() {
        var list = ((ProductRepository) repositories).GetProductsWithVariants();
        return ResponseEntity.ok(list);
    }

    // GET /seller/product/{id} — lấy chi tiết sản phẩm
    @GetMapping("{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        var product = repositories.GetById(id);
        if (product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        return ResponseEntity.ok(product);
    }

    // GET /seller/product/shop/{id} — lấy sản phẩm theo shop
    @GetMapping("shop/{id}")
    public ResponseEntity<?> getByShopId(@PathVariable int id) {
        var list = ((ProductRepository) repositories).GetByShopId(id);
        return ResponseEntity.ok(list);
    }

    // POST /seller/product — tạo sản phẩm mới
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody Product product) throws SQLException {
        if (product.getProduct_name() == null || product.getProduct_name().isBlank())
            return ResponseEntity.badRequest().body("product_name is required");
        if (product.getPrice() == null || product.getPrice() < 0)
            return ResponseEntity.badRequest().body("price is required and must be >= 0");
        if (product.getCategory_id() == null)
            return ResponseEntity.badRequest().body("category_id is required");

        var created = repositories.Create(product);
        if (created == null)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create product failed");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /seller/product/{id} — cập nhật sản phẩm
    @PutMapping("{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Product req) {
        Product existing = (Product) repositories.GetById(id);
        if (existing == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        if (req.getProduct_name() != null) existing.setProduct_name(req.getProduct_name());
        if (req.getDescription() != null) existing.setDescription(req.getDescription());
        if (req.getPrice() != null) existing.setPrice(req.getPrice());
        if (req.getOriginal_price() != null) existing.setOriginal_price(req.getOriginal_price());
        if (req.getStock_quantity() != null) existing.setStock_quantity(req.getStock_quantity());
        if (req.getCategory_id() != null) existing.setCategory_id(req.getCategory_id());

        Product updated = ((ProductRepository) repositories).Update(existing);
        if (updated == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update product failed");
        return ResponseEntity.ok(updated);
    }

    // DELETE /seller/product/{id} — xóa mềm sản phẩm (is_active = 0)
    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        Product existing = (Product) repositories.GetById(id);
        if (existing == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

        boolean deleted = ((ProductRepository) repositories).Delete(id);
        if (!deleted)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delete product failed");
        return ResponseEntity.ok(true);
    }
}
