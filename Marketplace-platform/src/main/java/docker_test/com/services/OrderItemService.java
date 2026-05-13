package docker_test.com.services;

import docker_test.com.models.OrderItem;
import docker_test.com.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository repository;

    public OrderItemService(OrderItemRepository repository) {
        this.repository = repository;
    }

    // CREATE
    public OrderItem create(OrderItem item) {
        item.setTotalPrice(item.getPrice() * item.getQuantity());
        return repository.save(item);
    }

    // GET ALL
    public List<OrderItem> getAll() {
        return repository.findAll();
    }

    // GET BY ID
    public OrderItem getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found"));
    }

    // GET BY ORDER ID
    public List<OrderItem> getByOrderId(long orderId) {
        return repository.findByOrderId(orderId);
    }

    // UPDATE
    public OrderItem update(Long id, OrderItem newItem) {
        OrderItem item = getById(id);

        item.setProductName(newItem.getProductName());
        item.setPrice(newItem.getPrice());
        item.setQuantity(newItem.getQuantity());
        item.setTotalPrice(newItem.getPrice() * newItem.getQuantity());

        return repository.save(item);
    }

    // DELETE
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
