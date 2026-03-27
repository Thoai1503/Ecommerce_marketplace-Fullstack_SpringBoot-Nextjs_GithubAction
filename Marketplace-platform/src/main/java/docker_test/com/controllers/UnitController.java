package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.Unit;
import docker_test.com.repository.UnitRepository;

@RestController
@RequestMapping("/api/unit")
public class UnitController {

    private final UnitRepository unitRepository;

    public UnitController() {
        this.unitRepository = UnitRepository.Instance();
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<Unit>> getAll() {
        return ResponseEntity.ok(unitRepository.GetAll());
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        Unit unit = unitRepository.GetById(id);

        if (unit == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Unit not found");
        }

        return ResponseEntity.ok(unit);
    }

    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Unit item) {

        try {
            // validate
            if (item.getLabel() == null || item.getLabel().isBlank()
                    || item.getSymbol() == null || item.getSymbol().isBlank()) {

                return ResponseEntity.badRequest().body("Label & Symbol required");
            }

            Unit saved = unitRepository.Create(item);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (SQLException e) {
            e.printStackTrace(); // debug backend
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Create failed: " + e.getMessage());
        }
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Unit item) {

        try {
            Unit existing = unitRepository.GetById(id);

            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Unit not found");
            }

            item.setId(id);

            Unit updated = unitRepository.Update(item);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update failed: " + e.getMessage());
        }
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {

        try {
            boolean deleted = unitRepository.Delete(id);

            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Unit not found");
            }

            return ResponseEntity.ok("Deleted successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Delete failed: " + e.getMessage());
        }
    }
}