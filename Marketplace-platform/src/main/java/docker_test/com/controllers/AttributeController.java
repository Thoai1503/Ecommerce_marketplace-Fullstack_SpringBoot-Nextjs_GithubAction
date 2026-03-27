package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.attribute.Attribute;
import docker_test.com.repository.AttributeRepository;

@RestController
@RequestMapping("api/attribute")
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
    public ResponseEntity<Attribute> create(@RequestBody Attribute item) throws SQLException {

        if (item.getName() == null || item.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Attribute saved = attributeRepository.Create(item);
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