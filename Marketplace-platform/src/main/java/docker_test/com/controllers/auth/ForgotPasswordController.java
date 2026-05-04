package docker_test.com.controllers.auth;

import docker_test.com.dto.auth.ForgotPasswordRequest;
import docker_test.com.dto.auth.ResetPasswordRequest;
import docker_test.com.dto.auth.VerifyOtpRequest;
import docker_test.com.services.ForgotPasswordService;
import docker_test.com.services.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class ForgotPasswordController {
    private final ForgotPasswordService forgotPasswordService;
    private final RateLimitService rateLimitService;

    @Value("${ratelimit.forgot-password.max:10}")
    private int forgotPasswordMaxRequests;

    public ForgotPasswordController(ForgotPasswordService forgotPasswordService,
                                    RateLimitService rateLimitService) {
        this.forgotPasswordService = forgotPasswordService;
        this.rateLimitService = rateLimitService;
    }

    private String clientIp(HttpServletRequest req) {
        String h = req.getHeader("X-Forwarded-For");
        if (h != null && !h.isBlank()) return h.split(",")[0].trim();
        return req.getRemoteAddr();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req,
            HttpServletRequest httpReq) {
        // Rate limit: 3 lần / 1 giờ / IP — chống spam gửi email
        if (!rateLimitService.allow("forgot-pwd:" + clientIp(httpReq), forgotPasswordMaxRequests, 60 * 60 * 1000L)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ."));
        }
        try {
            forgotPasswordService.forgotPassword(req.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến email của bạn"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest req,
            HttpServletRequest httpReq) {
        // Rate limit: 5 lần nhập sai / 10 phút / email — chống brute force OTP
        String rateLimitKey = "verify-otp:" + req.getEmail();
        if (!rateLimitService.allow(rateLimitKey, 5, 10 * 60 * 1000L)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới sau 10 phút."));
        }
        try {
            String resetToken = forgotPasswordService.verifyOtp(req.getEmail(), req.getOtp());
            return ResponseEntity.ok(Map.of("resetToken", resetToken));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        try {
            forgotPasswordService.resetPassword(req.getResetToken(), req.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được thay đổi thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
