package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.services.GenericCrudService;

@RestController
@RequestMapping("/api")
class GenericCrudController {
    
    private final GenericCrudService<Object, Integer> crudService;
    
   
    public GenericCrudController() {
        this.crudService = GenericCrudService.Instance();
    }
    
    @GetMapping("/{entityType}")
    public ResponseEntity<List<Object>> getAll(@PathVariable String entityType) {
        try {
            List<Object> entities = crudService.findAll(entityType);
            return ResponseEntity.ok(entities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{entityType}/{id}")
    public ResponseEntity<Object> getById(@PathVariable String entityType, 
                                          @PathVariable int id) {

            return ResponseEntity.ok( crudService.findById(entityType, id));
 
    }
    
    @PostMapping("/{entityType}")
    public ResponseEntity<Object> create(@PathVariable String entityType, 
                                         @RequestBody Object entity) throws SQLException {
        try {
            Object saved = crudService.save(entityType, entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{entityType}/{id}")
    public ResponseEntity<Void> delete(@PathVariable String entityType, 
                                       @PathVariable int id) {
        try {
            if (crudService.findById(entityType, id)!=null) {
                crudService.deleteById(entityType, id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    
    
    
//    @PutMapping("/{entityType}/{id}")
//    public ResponseEntity<Object> update(@PathVariable String entityType,
//                                         @PathVariable int id,
//                                         @RequestBody Object entity) {
//        try {
//            return crudService.findById(entityType, id)
//                    .map(existing -> {
//                        Object updated = crudService.save(entityType, entity);
//                        return ResponseEntity.ok(updated);
//                    })
//                    .orElse(ResponseEntity.notFound().build());
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    	return null;
//    }
//    
}