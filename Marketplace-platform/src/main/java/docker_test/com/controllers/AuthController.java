package docker_test.com.controllers;

import docker_test.com.models.PasswordResetToken;
import docker_test.com.models.User;
import docker_test.com.repository.PasswordResetTokenRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.EmailService;
import docker_test.com.services.OtpService;
import docker_test.com.services.RateLimitService;
import docker_test.com.utils.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Auth endpoints cho flow "admin tạo seller → gửi email set password".
 * - POST /auth/request-password-setup : sinh token + gửi email (dùng khi admin tạo seller invite-method)
 * - POST /auth/set-password           : seller submit token + new password
 * - GET  /auth/verify-token           : FE kiểm tra token còn hợp lệ trước khi cho nhập password
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private RateLimitService rateLimit;

    @Autowired
    private docker_test.com.services.DisposableEmailService disposableEmail;

    @org.springframework.beans.factory.annotation.Value("${app.dev-mode:false}")
    private boolean devMode;

    @org.springframework.beans.factory.annotation.Value("${app.resend-owner-email:}")
    private String resendOwnerEmail;

    private final UserRepository userRepository = UserRepository.Instance();
    private final PasswordResetTokenRepository tokenRepo = PasswordResetTokenRepository.Instance();

    private String clientIp(HttpServletRequest req) {
        String h = req.getHeader("X-Forwarded-For");
        if (h != null && !h.isBlank()) return h.split(",")[0].trim();
        return req.getRemoteAddr();
    }

    /* ======================== SELLER SELF-REGISTER ======================== */

    /** Gửi OTP 6 số tới email (flow seller self-register). */
    @PostMapping("/otp/send-register")
    public ResponseEntity<?> sendOtpRegister(@RequestBody Map<String, String> body, HttpServletRequest http) {
        String email = body == null ? null : body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email là bắt buộc"));
        }
        email = email.trim().toLowerCase();

        // LỚP 2 — Chặn email tạm thời (disposable)
        if (disposableEmail.isDisposable(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Không chấp nhận email tạm thời. Vui lòng dùng email cá nhân hoặc doanh nghiệp.",
                                  "reason", "DISPOSABLE_EMAIL"));
        }

        // LỚP 3 — Rate limit: 3 requests / 1 giờ / IP (siết chặt hơn, anti-bot)
        if (!rateLimit.allow("otp-send:" + clientIp(http), 3, 60 * 60 * 1000L)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 1 giờ.",
                                  "reason", "RATE_LIMIT_IP"));
        }
        // Rate limit phụ: 3 OTP / 5 phút / email (chống spam 1 inbox)
        if (!rateLimit.allow("otp-send-email:" + email, 3, 5 * 60 * 1000L)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Email này đã yêu cầu OTP quá nhiều lần. Vui lòng chờ 5 phút.",
                                  "reason", "RATE_LIMIT_EMAIL"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email đã tồn tại"));
        }
        try {
            String code = otpService.generateAndStore(email);
            try {
                emailService.sendOtpEmail(email, code);
                return ResponseEntity.ok(Map.of("message", "Đã gửi OTP", "email", email));
            } catch (Exception mailEx) {
                // Trong DEV mode: nếu gửi email fail (VD Resend free tier chỉ gửi cho owner),
                // log OTP ra console + trả OTP về FE để demo được.
                if (devMode) {
                    System.out.println("========================================");
                    System.out.println("[DEV MODE] Email send failed, OTP logged:");
                    System.out.println("  → Email: " + email);
                    System.out.println("  → OTP  : " + code);
                    System.out.println("  → Reason: " + mailEx.getMessage());
                    System.out.println("========================================");
                    Map<String, Object> r = new HashMap<>();
                    r.put("message", "[DEV MODE] Không gửi được email, OTP hiển thị bên dưới");
                    r.put("email", email);
                    r.put("devOtp", code); // chỉ trả ở DEV mode
                    r.put("devReason", "Resend free tier chỉ gửi được tới " + resendOwnerEmail);
                    return ResponseEntity.ok(r);
                }
                throw mailEx;
            }
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không gửi được email: " + e.getMessage()));
        }
    }

    // NOTE: POST /auth/seller/register được xử lý ở SellerAuthController

    /* ======================== REQUEST SETUP ======================== */

    public static class RequestSetupBody {
        public String email;
        public String shopName; // optional - hiển thị trong email
    }

    @PostMapping("/request-password-setup")
    public ResponseEntity<?> requestPasswordSetup(@RequestBody RequestSetupBody req) {
        if (req.email == null || req.email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email là bắt buộc"));
        }

        User user = userRepository.findByEmail(req.email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Email không tồn tại"));
        }

        // Huỷ token cũ chưa dùng + tạo token mới
        tokenRepo.invalidateExistingForUser(user.getId(), "SET_PASSWORD");
        String token = tokenRepo.createForUser(user.getId(), "SET_PASSWORD", 24);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không tạo được token"));
        }

        // Gửi email (không block response nếu lỗi email — log + trả 500)
        try {
            String name = req.shopName != null && !req.shopName.isBlank()
                    ? req.shopName
                    : (user.getFullName() != null ? user.getFullName() : user.getEmail());
            emailService.sendSellerWelcomeEmail(user.getEmail(), name, token);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không gửi được email: " + e.getMessage()));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Đã gửi email thiết lập mật khẩu");
        body.put("email", user.getEmail());
        return ResponseEntity.ok(body);
    }

    /* ======================== VERIFY TOKEN ======================== */

    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        PasswordResetToken t = tokenRepo.findByToken(token);
        if (t == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("valid", false, "reason", "Token không tồn tại"));
        }
        if (t.isUsed()) {
            return ResponseEntity.ok(Map.of("valid", false, "reason", "Token đã được sử dụng"));
        }
        if (t.isExpired()) {
            return ResponseEntity.ok(Map.of("valid", false, "reason", "Token đã hết hạn"));
        }

        User user = userRepository.GetById(t.getUserId().intValue());
        Map<String, Object> body = new HashMap<>();
        body.put("valid", true);
        body.put("email", user != null ? user.getEmail() : null);
        body.put("fullName", user != null ? user.getFullName() : null);
        return ResponseEntity.ok(body);
    }

    /* ======================== SET PASSWORD ======================== */

    public static class SetPasswordBody {
        public String token;
        public String password;
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestBody SetPasswordBody req) {
        if (req.token == null || req.token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu token"));
        }
        if (req.password == null || req.password.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mật khẩu phải từ 8 ký tự trở lên"));
        }
        // Yêu cầu: ít nhất 1 chữ hoa + 1 số
        if (!req.password.matches(".*[A-Z].*") || !req.password.matches(".*[0-9].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mật khẩu phải có ít nhất 1 chữ in hoa và 1 số"));
        }

        PasswordResetToken t = tokenRepo.findByToken(req.token);
        if (t == null || !t.isValid()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token không hợp lệ hoặc đã hết hạn"));
        }

        String newHash = PasswordUtil.hash(req.password);
        boolean ok = userRepository.updatePasswordHash(t.getUserId(), newHash);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không cập nhật được mật khẩu"));
        }

        tokenRepo.markUsed(t.getId());
        return ResponseEntity.ok(Map.of("message", "Thiết lập mật khẩu thành công"));
    }
}
