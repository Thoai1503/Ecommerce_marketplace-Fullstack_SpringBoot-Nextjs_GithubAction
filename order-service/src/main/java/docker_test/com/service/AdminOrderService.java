package docker_test.com.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import docker_test.com.dto.OrderPageResponse;
import docker_test.com.model.Order;
import docker_test.com.repository.OrderRepository;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public AdminOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderPageResponse getAdminOrders(
            Long userId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Double minAmount,
            Double maxAmount,
            String status,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        List<Order> orders = orderRepository.findAllWithPagination(
                userId,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                status,
                sortBy,
                sortOrder,
                page,
                size
        );

        int totalRecords = orderRepository.countOrders(
                userId,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                status
        );

        int totalPages = (int) Math.ceil((double) totalRecords / Math.max(size, 1));

        Map<String, Integer> statusStats = orderRepository.countByStatus();
        Double pendingAmount = orderRepository.getPendingTotalAmount();

        return new OrderPageResponse(
                orders,
                totalRecords,
                totalPages,
                page,
                statusStats,
                pendingAmount
        );
    }

    public Order getAdminOrderById(Long id) {
        if (id == null) {
            return null;
        }
        return orderRepository.findByIdOrNull(id);
    }
}
