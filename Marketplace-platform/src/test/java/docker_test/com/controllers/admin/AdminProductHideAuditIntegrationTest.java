package docker_test.com.controllers.admin;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Disabled("Requires a running Marketplace API, seeded product data, and Phase 4 migrations applied.")
class AdminProductHideAuditIntegrationTest {
    private final HttpClient http = HttpClient.newHttpClient();
    private final String baseUrl = System.getProperty("marketplace.api", "http://localhost:8001");

    @Test
    void hideRequiresReasonAndReturnsAuditFields() throws Exception {
        HttpRequest missingReason = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/admin/products/1/status"))
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString("{\"status\":\"HIDDEN\"}"))
                .build();

        HttpResponse<String> badResponse = http.send(missingReason, HttpResponse.BodyHandlers.ofString());
        assertEquals(400, badResponse.statusCode());

        HttpRequest withReason = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/admin/products/1/status"))
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString(
                        "{\"status\":\"HIDDEN\",\"reason\":\"Vi phạm quy định hình ảnh\"}"
                ))
                .build();

        HttpResponse<String> okResponse = http.send(withReason, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, okResponse.statusCode());
        assertTrue(okResponse.body().contains("\"status\":\"HIDDEN\""));
        assertTrue(okResponse.body().contains("\"hiddenReason\":\"Vi phạm quy định hình ảnh\""));
    }
}
