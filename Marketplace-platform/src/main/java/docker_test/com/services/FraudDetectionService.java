package docker_test.com.services;

import com.google.gson.Gson;
import docker_test.com.configs.DBConnection;
import docker_test.com.dto.FraudCheckResult;
import docker_test.com.dto.FraudCheckResult.RuleHit;
import docker_test.com.models.product.Product;
import docker_test.com.models.product.ProductImage;
import docker_test.com.repository.ProductFraudCheckRepository;
import docker_test.com.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class FraudDetectionService {
    private final ProductRepository productRepository = ProductRepository.Instance();
    private final ProductFraudCheckRepository fraudRepository = ProductFraudCheckRepository.Instance();
    private final DBConnection dbConnection = DBConnection.getInstance();
    private final Gson gson = new Gson();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final AtomicInteger llmRequests = new AtomicInteger(0);
    private volatile Instant rateWindowStart = Instant.now();

    @Value("${ai.fraud-detection.enabled:false}")
    private boolean llmEnabled;

    @Value("${ai.fraud-detection.provider:openai}")
    private String provider;

    @Value("${ai.fraud-detection.threshold:50}")
    private int llmThreshold;

    @Value("${ai.fraud-detection.cache-hours:24}")
    private int cacheHours;

    @Value("${ai.fraud-detection.max-requests-per-hour:100}")
    private int maxRequestsPerHour;

    @Value("${openai.api-key:${OPENAI_API_KEY:}}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${anthropic.api-key:${ANTHROPIC_API_KEY:}}")
    private String anthropicApiKey;

    @Value("${anthropic.model:claude-haiku-4-5}")
    private String anthropicModel;

    public FraudCheckResult analyzeProduct(int productId, boolean force) {
        FraudCheckResult cached = !force ? fraudRepository.findFresh(productId, cacheHours) : null;
        if (cached != null) return cached;

        Product product = productRepository.GetById(productId);
        if (product == null) return null;

        FraudCheckResult result = runHeuristics(product);
        if (llmEnabled && result.fraudScore >= llmThreshold && withinRateLimit()) {
            enrichWithLlm(product, result);
        }
        return fraudRepository.upsert(result);
    }

    public void analyzeProductAsync(int productId) {
        CompletableFuture.runAsync(() -> {
            try {
                analyzeProduct(productId, false);
            } catch (Exception e) {
                System.err.println("[FraudDetectionService] async analysis failed: " + e.getMessage());
            }
        });
    }

    private FraudCheckResult runHeuristics(Product product) {
        FraudCheckResult result = new FraudCheckResult();
        result.productId = product.getId();
        result.checkedAt = LocalDateTime.now();
        result.checkedBy = "heuristic";

        addIf(result, duplicateName(product), "duplicate_name", "medium", "Tên sản phẩm trùng với shop khác", 15);
        addIf(result, suspiciousLowPrice(product), "suspicious_low_price", "medium", "Giá thấp bất thường so với danh mục", 15);
        addIf(result, brandMismatch(product), "brand_mismatch", "medium", "Mô tả nhắc thương hiệu khác với trường thương hiệu", 15);
        addIf(result, product.getStock_quantity() != null && product.getStock_quantity() > 10_000,
                "stock_too_high", "low", "Tồn kho cao bất thường", 8);
        addIf(result, copiedDescriptionHeuristic(product), "description_copy_from_web", "high",
                "Mô tả có dấu hiệu sao chép từ website khác", 25);
        addIf(result, newSellerExpensiveProduct(product), "new_seller_expensive_product", "high",
                "Seller mới đăng sản phẩm giá trị cao", 25);
        addIf(result, unusualSkuPattern(product), "unusual_sku_pattern", "low", "SKU/slug không theo mẫu dễ quản lý", 8);
        addIf(result, imageReuse(product), "image_reuse", "high", "Ảnh sản phẩm đã được dùng ở sản phẩm khác", 25);

        result.fraudScore = Math.min(100, result.triggeredRules.stream().mapToInt(rule -> rule.score).sum());
        result.recommendation = result.fraudScore >= 75 ? "reject" : result.fraudScore >= 30 ? "review" : "approve";
        result.reasoning = result.triggeredRules.isEmpty()
                ? "Không phát hiện dấu hiệu rủi ro rõ ràng từ bộ luật heuristic."
                : "Phát hiện " + result.triggeredRules.size() + " dấu hiệu cần kiểm tra thủ công.";
        return result;
    }

    private void addIf(FraudCheckResult result, boolean condition, String rule, String severity, String message, int score) {
        if (!condition) return;
        result.concerns.add(message);
        result.triggeredRules.add(new RuleHit(rule, severity, message, score));
    }

    private boolean duplicateName(Product product) {
        String sql = "SELECT COUNT(*) AS cnt FROM product WHERE LOWER(product_name) = LOWER(?) AND id <> ? AND shop_id <> ?";
        return queryCount(sql, product.getProduct_name(), product.getId(), product.getShop_id()) > 0;
    }

    private boolean suspiciousLowPrice(Product product) {
        if (product.getPrice() == null || product.getCategory_id() == null) return false;
        String sql = "SELECT AVG(price) AS avg_price FROM product WHERE category_id = ? AND id <> ? AND price > 0";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, product.getCategory_id());
            ps.setInt(2, product.getId());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    double avg = rs.getDouble("avg_price");
                    return avg > 0 && product.getPrice() < avg * 0.3;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("[FraudDetectionService.suspiciousLowPrice] failed: " + e.getMessage(), e);
        }
        return false;
    }

    private boolean brandMismatch(Product product) {
        String description = safe(product.getDescription()).toLowerCase(Locale.ROOT);
        String brand = safe(product.getBrand()).toLowerCase(Locale.ROOT);
        List<String> knownBrands = List.of("apple", "samsung", "sony", "lg", "xiaomi", "nike", "adidas", "rolex");
        return knownBrands.stream().anyMatch(candidate -> description.contains(candidate) && !brand.contains(candidate));
    }

    private boolean copiedDescriptionHeuristic(Product product) {
        String description = safe(product.getDescription()).toLowerCase(Locale.ROOT);
        return description.contains("http://")
                || description.contains("https://")
                || description.contains("tiki")
                || description.contains("shopee")
                || description.contains("lazada")
                || description.contains("sendo");
    }

    private boolean newSellerExpensiveProduct(Product product) {
        if (product.getPrice() == null || product.getPrice() <= 5_000_000 || product.getShop_id() == null) return false;
        String sql = "SELECT COALESCE(total_products, 0) AS total_products FROM shop WHERE id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, product.getShop_id());
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt("total_products") < 5;
            }
        } catch (Exception e) {
            throw new RuntimeException("[FraudDetectionService.newSellerExpensiveProduct] failed: " + e.getMessage(), e);
        }
    }

    private boolean unusualSkuPattern(Product product) {
        String sku = safe(product.getProduct_slug());
        return sku.isBlank() || sku.length() < 4 || sku.matches("\\d+");
    }

    private boolean imageReuse(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) return false;
        for (ProductImage image : product.getImages()) {
            if (image.getImage_url() == null || image.getImage_url().isBlank()) continue;
            String sql = "SELECT COUNT(*) AS cnt FROM product_image WHERE image_url = ? AND product_id <> ?";
            if (queryCount(sql, image.getImage_url(), product.getId()) > 0) return true;
        }
        return false;
    }

    private long queryCount(String sql, Object... params) {
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong("cnt");
            }
        } catch (Exception e) {
            throw new RuntimeException("[FraudDetectionService.queryCount] failed: " + e.getMessage(), e);
        }
        return 0;
    }

    private boolean withinRateLimit() {
        Instant now = Instant.now();
        if (now.minusSeconds(3600).isAfter(rateWindowStart)) {
            rateWindowStart = now;
            llmRequests.set(0);
        }
        return llmRequests.incrementAndGet() <= maxRequestsPerHour;
    }

    private void enrichWithLlm(Product product, FraudCheckResult result) {
        String apiKey = provider.equalsIgnoreCase("anthropic") ? anthropicApiKey : openaiApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            result.reasoning += " LLM bị bỏ qua vì chưa cấu hình API key.";
            return;
        }

        try {
            String prompt = """
                Analyze this product listing for suspicious activity. Do not use or request personal data.
                Return compact JSON with fraudScore, concerns, recommendation, reasoning.
                Product:
                - Name: %s
                - Description: %s
                - Brand: %s
                - Price: %s
                - Category ID: %s
                - Seller shop ID: %s
                """.formatted(
                    safe(product.getProduct_name()),
                    safe(product.getDescription()),
                    safe(product.getBrand()),
                    product.getPrice(),
                    product.getCategory_id(),
                    product.getShop_id()
            );

            String content = provider.equalsIgnoreCase("anthropic")
                    ? callAnthropic(apiKey, prompt)
                    : callOpenAi(apiKey, prompt);
            if (content != null && !content.isBlank()) {
                result.checkedBy = provider.toLowerCase(Locale.ROOT);
                result.reasoning += "\nLLM analysis: " + content;
            }
        } catch (Exception e) {
            result.reasoning += " LLM analysis failed, kept heuristic-only result.";
        }
    }

    private String callOpenAi(String apiKey, String prompt) throws Exception {
        Map<String, Object> body = Map.of(
                "model", openaiModel,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a marketplace fraud analyst. Return JSON only."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0
        );
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    private String callAnthropic(String apiKey, String prompt) throws Exception {
        Map<String, Object> body = Map.of(
                "model", anthropicModel,
                "max_tokens", 600,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
