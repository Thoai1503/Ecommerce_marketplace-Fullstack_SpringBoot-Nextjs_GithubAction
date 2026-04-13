package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.attribute.AttributeValue;
import docker_test.com.repository.AttributeValueRepository;

@RestController
@RequestMapping("/api/attribute-value")
public class AttributeValueController {

    private final AttributeValueRepository repository;

    public AttributeValueController() {
        this.repository = AttributeValueRepository.Instance();
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<AttributeValue>> getAll() {
        return ResponseEntity.ok(repository.GetAll());
    }

    // ================= GET BY ATTRIBUTE =================
    @GetMapping("/attribute/{attributeId}")
    public ResponseEntity<List<AttributeValue>> getByAttribute(@PathVariable int attributeId) {
        return ResponseEntity.ok(repository.GetByAttributeId(attributeId));
    }

    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<?> create(@RequestBody AttributeValue item) {
        try {
            if (item.getAttribute_id() <= 0 || item.getValue() == null) {
                return ResponseEntity.badRequest().body("Invalid data");
            }

            AttributeValue saved = repository.Create(item);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody AttributeValue item) {

        item.setId(id);

        boolean updated = repository.Update(item);

        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        }

        return ResponseEntity.ok("Updated successfully");
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {

        boolean deleted = repository.Delete(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        }

        return ResponseEntity.ok("Deleted successfully");
    }
}