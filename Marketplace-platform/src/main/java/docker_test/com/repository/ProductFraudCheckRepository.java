package docker_test.com.repository;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import docker_test.com.configs.DBConnection;
import docker_test.com.dto.FraudCheckResult;
import docker_test.com.dto.FraudCheckResult.RuleHit;

import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProductFraudCheckRepository {
    private static ProductFraudCheckRepository instance;
    private final DBConnection dbConnection;
    private final Gson gson = new Gson();
    private final Type stringListType = new TypeToken<List<String>>() {}.getType();
    private final Type ruleListType = new TypeToken<List<RuleHit>>() {}.getType();

    private ProductFraudCheckRepository() {
        this.dbConnection = DBConnection.getInstance();
    }

    public static ProductFraudCheckRepository Instance() {
        if (instance == null) instance = new ProductFraudCheckRepository();
        return instance;
    }

    public FraudCheckResult findFresh(long productId, int maxAgeHours) {
        String sql = """
            SELECT * FROM product_fraud_check
            WHERE product_id = ? AND checked_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        """;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            ps.setInt(2, maxAgeHours);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductFraudCheckRepository.findFresh] failed: " + e.getMessage(), e);
        }
        return null;
    }

    public FraudCheckResult findLatest(long productId) {
        String sql = "SELECT * FROM product_fraud_check WHERE product_id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        } catch (Exception e) {
            throw new RuntimeException("[ProductFraudCheckRepository.findLatest] failed: " + e.getMessage(), e);
        }
        return null;
    }

    public FraudCheckResult upsert(FraudCheckResult result) {
        String sql = """
            INSERT INTO product_fraud_check
              (product_id, fraud_score, concerns, recommendation, reasoning, checked_at, checked_by)
            VALUES (?, ?, CAST(? AS JSON), ?, ?, NOW(), ?)
            ON DUPLICATE KEY UPDATE
              fraud_score = VALUES(fraud_score),
              concerns = VALUES(concerns),
              recommendation = VALUES(recommendation),
              reasoning = VALUES(reasoning),
              checked_at = VALUES(checked_at),
              checked_by = VALUES(checked_by)
        """;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, result.productId);
            ps.setInt(2, result.fraudScore);
            ps.setString(3, gson.toJson(result.concerns));
            ps.setString(4, result.recommendation);
            ps.setString(5, appendRulesToReasoning(result));
            ps.setString(6, result.checkedBy);
            ps.executeUpdate();
            return findLatest(result.productId);
        } catch (Exception e) {
            throw new RuntimeException("[ProductFraudCheckRepository.upsert] failed: " + e.getMessage(), e);
        }
    }

    private FraudCheckResult mapRow(ResultSet rs) throws Exception {
        FraudCheckResult result = new FraudCheckResult();
        result.productId = rs.getLong("product_id");
        result.fraudScore = rs.getInt("fraud_score");
        result.recommendation = rs.getString("recommendation");
        String rawReasoning = rs.getString("reasoning");
        int marker = rawReasoning != null ? rawReasoning.indexOf("RULES_JSON:") : -1;
        result.reasoning = marker >= 0 ? rawReasoning.substring(0, marker).trim() : rawReasoning;
        result.checkedBy = rs.getString("checked_by");
        var checkedAt = rs.getTimestamp("checked_at");
        result.checkedAt = checkedAt != null ? checkedAt.toLocalDateTime() : LocalDateTime.now();

        String concernsJson = rs.getString("concerns");
        result.concerns = concernsJson != null ? gson.fromJson(concernsJson, stringListType) : new ArrayList<>();
        result.triggeredRules = extractRulesFromReasoning(rawReasoning);
        return result;
    }

    private String appendRulesToReasoning(FraudCheckResult result) {
        String reasoning = result.reasoning != null ? result.reasoning : "";
        return reasoning + "\n\nRULES_JSON:" + gson.toJson(result.triggeredRules);
    }

    private List<RuleHit> extractRulesFromReasoning(String reasoning) {
        if (reasoning == null) return new ArrayList<>();
        int index = reasoning.indexOf("RULES_JSON:");
        if (index < 0) return new ArrayList<>();
        try {
            return gson.fromJson(reasoning.substring(index + "RULES_JSON:".length()).trim(), ruleListType);
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }
}
