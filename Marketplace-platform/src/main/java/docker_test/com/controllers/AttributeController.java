package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.attribute.Attribute;
import docker_test.com.repository.AttributeRepository;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/attribute")
public class AttributeController {

    private final AttributeRepository attributeRepository;

    public AttributeController() {
        this.attributeRepository = AttributeRepository.Instance();
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<Attribute>> getAll() {

    	List<Attribute> list = attributeRepository.GetAll();
    	System.out.println("Attributes retrieved: " + list.size());
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

        item.setId(id);

        Attribute updated = attributeRepository.Update(item);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ================= DELETE (SOFT) =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {

    	Attribute attribute = new Attribute();
    	attribute.setId(id);

        boolean deleted = attributeRepository.Delete(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
