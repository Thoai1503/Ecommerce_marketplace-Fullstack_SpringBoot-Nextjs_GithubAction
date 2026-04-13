package docker_test.com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import docker_test.com.model.OrderShipmentStatusHistory;

@Repository
public interface OrderShipmentStatusHistoryRepository extends JpaRepository<OrderShipmentStatusHistory, Long> {
    List<OrderShipmentStatusHistory> findByOrderShipmentIdOrderByChangedAtAscIdAsc(Long orderShipmentId);
}