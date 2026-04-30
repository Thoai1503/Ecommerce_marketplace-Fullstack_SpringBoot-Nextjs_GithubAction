package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.attribute.Attribute;
import docker_test.com.models.CategoryAttribute;
import docker_test.com.repository.AttributeRepository;
import docker_test.com.repository.CategoryAttributeRepository;

@RestController
@RequestMapping("api/attributes")
public class AttributeController {

    private final AttributeRepository attributeRepository;

    public AttributeController() {
        this.attributeRepository = AttributeRepository.Instance();
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<Attribute>> getAll() {
        List<Attribute> list = attributeRepository.GetAll();
        return ResponseEntity.ok(list);
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<Attribute> getById(@PathVariable int id) {

        Attribute attribute = attributeRepository.GetById(id);

        if (attribute == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(attribute);
    }

    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Attribute item,
                                    @RequestParam(required = false) Integer autoAddCategoryId) throws SQLException {

        if (item.getName() == null || item.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Attribute name cannot be empty");
        }

        // Auto generate slug if not provided
        if (item.getSlug() == null || item.getSlug().isBlank()) {
            item.setSlug(item.getName().toLowerCase().replaceAll("\\s+", "-"));
        }

        // Set default status to ACTIVE (1) if null
        if (item.getStatus() == null) {
            item.setStatus(1);
        }

        Attribute saved = attributeRepository.Create(item);

        // 🔥 If autoAddCategoryId provided, create category_attribute link
        if (autoAddCategoryId != null && autoAddCategoryId > 0 && saved != null && saved.getId() != null && saved.getId() > 0) {
            try {
                CategoryAttribute categoryAttribute = new CategoryAttribute();
                categoryAttribute.setCategoryId(autoAddCategoryId);
                categoryAttribute.setAttributeId(saved.getId());
                categoryAttribute.setStatus(1);

                CategoryAttributeRepository categoryAttributeRepo = CategoryAttributeRepository.Instance();
                categoryAttributeRepo.Create(categoryAttribute);
                System.out.println("✅ Successfully linked attribute " + saved.getId() + " to category " + autoAddCategoryId);
            } catch (SQLException e) {
                // Check if it's a duplicate entry
                if (e.getMessage() != null && e.getMessage().contains("Duplicate")) {
                    System.out.println("ℹ️ Attribute already linked to this category (duplicate)");
                } else {
                    System.err.println("❌ Error linking attribute to category: " + e.getMessage());
                    e.printStackTrace();
                }
                // Don't fail - attribute was already created successfully
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<Attribute> update(
            @PathVariable int id,
            @RequestBody Attribute item) {

        // 🔥 Lấy dữ liệu cũ trước
        Attribute existing = attributeRepository.GetById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // 🔥 Merge data (tránh mất name, slug)
        if (item.getName() != null) {
            existing.setName(item.getName());
        }

        if (item.getSlug() != null) {
            existing.setSlug(item.getSlug());
        }

        if (item.getStatus() != null) {
            existing.setStatus(item.getStatus());
        }

        Attribute updated = attributeRepository.Update(existing);

        return ResponseEntity.ok(updated);
    }

    // ================= DELETE (SOFT) =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {

        boolean deleted = attributeRepository.Delete(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
