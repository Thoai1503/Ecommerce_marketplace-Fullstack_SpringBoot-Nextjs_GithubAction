package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.Brand;
import docker_test.com.models.CategoryBrand;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.CategoryBrandRepository;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final IRepositories<Brand> repositories;

    public BrandController() {
        repositories = RepoFactoryImpl.Instance().createRepo("brand");
    }

    // ===== GET ALL =====
    @GetMapping("")
    public ResponseEntity<List<Brand>> getAll() {
        return ResponseEntity.ok(repositories.GetAll());
    }

    // ===== GET BY ID =====
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {

        Brand item = repositories.GetById(id);

        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Brand not found");
        }

        return ResponseEntity.ok(item);
    }

    // ===== CREATE =====
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody Brand item, 
                                    @RequestParam(required = false) Integer autoAddCategoryId) {

        try {

            if (item.getName() == null || item.getName().isBlank()) {
                return ResponseEntity.badRequest().body("Brand name cannot be empty");
            }

            // auto slug
            if (item.getSlug() == null || item.getSlug().isBlank()) {
                item.setSlug(item.getName().toLowerCase().replaceAll("\\s+", "-"));
            }

            if (item.getStatus() == null) {
                item.setStatus(1);
            }

            Brand created = repositories.Create(item);

            // 🔥 Nếu có autoAddCategoryId, tạo liên kết category_brand
            if (autoAddCategoryId != null && autoAddCategoryId > 0 && created != null) {
                try {
                    CategoryBrand categoryBrand = new CategoryBrand();
                    categoryBrand.setCategory_id(autoAddCategoryId);
                    categoryBrand.setBrand_id(created.getId());
                    categoryBrand.setStatus(1);

                    IRepositories<CategoryBrand> categoryBrandRepo = 
                        RepoFactoryImpl.Instance().createRepo("category_brand");
                    categoryBrandRepo.Create(categoryBrand);
                } catch (Exception e) {
                    // Log nhưng không fail, brand đã được tạo
                    e.printStackTrace();
                    System.out.println("Warning: Could not link brand to category");
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Create brand failed");
        }
    }

    // ===== UPDATE =====
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Brand req) {

        Brand existing = repositories.GetById(id);

        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Brand not found");
        }

        existing.setId(id);

        if (req.getName() != null) existing.setName(req.getName());
        if (req.getSlug() != null) existing.setSlug(req.getSlug());
        if (req.getLogo() != null) existing.setLogo(req.getLogo());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());

        Brand updated = repositories.Update(existing);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update failed");
        }

        return ResponseEntity.ok(updated);
    }

    // ===== DELETE =====
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {

        boolean deleted = repositories.Delete(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Brand not found");
        }

        return ResponseEntity.ok("Deleted successfully");
    }
}