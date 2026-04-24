package docker_test.com.controllers;

import docker_test.com.models.OrderItem;
import docker_test.com.services.OrderItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/order-items")
@CrossOrigin(origins = "*")
public class OrderItemController {

    private final OrderItemService service;

    public OrderItemController(OrderItemService service) {
        this.service = service;
    }

    @PostMapping
    public OrderItem create(@RequestBody OrderItem item) {
        return service.create(item);
    }

    @GetMapping
    public List<OrderItem> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public OrderItem getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItem> getByOrderId(@PathVariable long orderId) {
        return service.getByOrderId(orderId);
    }

    @PutMapping("/{id}")
    public OrderItem update(@PathVariable Long id, @RequestBody OrderItem item) {
        return service.update(id, item);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }
}