package docker_test.com.controllers;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.Shop;
import docker_test.com.repository.ShopRepository;

@RestController
@RequestMapping("/shops")
public class ShopController {

    private ShopRepository shopRepository;

    public ShopController() {
        this.shopRepository = ShopRepository.Instance();
    }

    @GetMapping("")
    public ResponseEntity<?> getAll() {
        var list = shopRepository.GetAll();
        return ResponseEntity.ok(list);
    }

    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody Shop item) throws SQLException {
        var result = shopRepository.Create(item);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        var shop = shopRepository.GetById(id);

        if (shop == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(shop);
    }
}
