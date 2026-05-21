package docker_test.com.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import docker_test.com.dto.OrderPricingSnapshotDTO;

@Service
public class OrderPricingSnapshotService {

    private final RestTemplate restTemplate;
    private final String orderServiceUrl;

    public OrderPricingSnapshotService(
            @Value("${order.service.url:http://localhost:8002}") String orderServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.orderServiceUrl = orderServiceUrl;
    }

    public OrderPricingSnapshotDTO getOrderPricingSnapshot(Long orderId) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException("orderId is required");
        }

        String requestUrl = normalizeBaseUrl(orderServiceUrl) + "/api/orders/" + orderId;
        ResponseEntity<OrderPricingSnapshotDTO> response =
                restTemplate.getForEntity(requestUrl, OrderPricingSnapshotDTO.class);

        OrderPricingSnapshotDTO body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null) {
            throw new IllegalStateException("Cannot load order pricing snapshot for order " + orderId);
        }

        return body;
    }

    private String normalizeBaseUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return "http://localhost:8002";
        }
        String trimmed = rawUrl.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }
}
