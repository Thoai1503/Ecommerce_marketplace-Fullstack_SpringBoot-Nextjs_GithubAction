package logistic_service.com.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

import logistic_service.com.dto.CalculateFeeRequest;
import logistic_service.com.dto.CalculateFeeResponse;

@Service
public class ShippingFeeService {

    private final RestClient restClient;
    private final String providerUrl;
    private final String providerToken;

    public ShippingFeeService(
            RestClient.Builder restClientBuilder,
            @Value("${logistics.fee.provider.url:}") String providerUrl,
            @Value("${logistics.fee.provider.token:}") String providerToken) {
        this.restClient = restClientBuilder.build();
        this.providerUrl = providerUrl;
        this.providerToken = providerToken;
    }

    public CalculateFeeResponse calculateFee(CalculateFeeRequest request) {
        if (providerUrl == null || providerUrl.isBlank()) {
            throw new IllegalStateException("Logistics fee provider URL is not configured.");
        }

        JsonNode response = restClient.post()
                .uri(providerUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Token", providerToken == null ? "" : providerToken)
                .body(request)
                .retrieve()
                .body(JsonNode.class);

        int total = response != null
                ? response.path("data").path("total").asInt(0)
                : 0;

        return new CalculateFeeResponse(total, "LOGS");
    }
}
