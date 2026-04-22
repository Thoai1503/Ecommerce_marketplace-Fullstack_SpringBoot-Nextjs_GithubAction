package docker_test.com.controller;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.OrderPageResponse;
import docker_test.com.model.Order;
import docker_test.com.repository.OrderRepository;
import docker_test.com.service.AdminOrderService;

@RestController("")
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final AdminOrderService adminOrderService;

    public AdminOrderController(OrderRepository orderRepository, AdminOrderService adminOrderService) {
        this.orderRepository = orderRepository;
        this.adminOrderService = adminOrderService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Order item) {
        try {
            return ResponseEntity.ok(orderRepository.save(item));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Create order failed", "error", e.getMessage()));
        }
    }

    @GetMapping("")
    public OrderPageResponse getOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

        return adminOrderService.getAdminOrders(
                userId,
                start,
                end,
                minAmount,
                maxAmount,
                status,
                sortBy,
                sortOrder,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Order order = adminOrderService.getAdminOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("message", "Order not found", "id", id));
        }
        return ResponseEntity.ok(order);
    }
}
