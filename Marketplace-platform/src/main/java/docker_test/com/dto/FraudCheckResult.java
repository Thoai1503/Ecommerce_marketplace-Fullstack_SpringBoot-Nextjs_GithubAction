package docker_test.com.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FraudCheckResult {
    public long productId;
    public int fraudScore;
    public List<String> concerns = new ArrayList<>();
    public String recommendation;
    public String reasoning;
    public String checkedBy;
    public LocalDateTime checkedAt;
    public List<RuleHit> triggeredRules = new ArrayList<>();

    public static class RuleHit {
        public String rule;
        public String severity;
        public String message;
        public int score;

        public RuleHit() {}

        public RuleHit(String rule, String severity, String message, int score) {
            this.rule = rule;
            this.severity = severity;
            this.message = message;
            this.score = score;
        }
    }
}
