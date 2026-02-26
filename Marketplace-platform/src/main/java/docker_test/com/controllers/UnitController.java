package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.Unit;
import docker_test.com.repository.UnitRepository;

@RestController
@RequestMapping("/unit")
public class UnitController {

    private final UnitRepository unitRepository;

    public UnitController() {
        this.unitRepository = UnitRepository.Instance();
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<Unit>> getAll() {

    	List<Unit> list = unitRepository.GetAll();
        return ResponseEntity.ok(list);
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<Unit> getById(@PathVariable int id) {

        Unit unit = unitRepository.GetById(id);

        if (unit == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(unit);
    }

    // ================= CREATE =================
    @PostMapping
    public ResponseEntity<Unit> create(@RequestBody Unit item) throws SQLException {

        if (item.getLabel() == null || item.getLabel().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Unit saved = unitRepository.Create(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<Unit> update(
            @PathVariable int id,
            @RequestBody Unit item) {

        item.setId(id);

        Unit updated = unitRepository.Update(item);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ================= DELETE (SOFT) =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {

        Unit unit = new Unit();
        unit.setId(id);

        boolean deleted = unitRepository.Delete(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
