package docker_test.com.services;

import docker_test.com.models.Order;
import docker_test.com.repository.OrderRepository;
import docker_test.com.models.OrderPageResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService() {
        this.orderRepository = OrderRepository.Instance();
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
                userId, startDate, endDate,
                minAmount, maxAmount,
                status, sortBy, sortOrder,
                page, size
        );

        int totalRecords = orderRepository.countOrders(
                userId, startDate, endDate,
                minAmount, maxAmount, status
        );

        int totalPages = (int) Math.ceil((double) totalRecords / size);

        Map<String, Integer> statusStats = orderRepository.countByStatus();

        Double pendingAmount = orderRepository.getPendingTotalAmount();
   System.out.println("Orders: " + orders);
   orders.forEach(order -> System.out.println("Order ID: " + order.getOrderId() + ", Status: " + order.getOrderStatus() + ", Amount: " + order.getTotalAmount()));
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
                return orderRepository.findById(id);
        }
}
