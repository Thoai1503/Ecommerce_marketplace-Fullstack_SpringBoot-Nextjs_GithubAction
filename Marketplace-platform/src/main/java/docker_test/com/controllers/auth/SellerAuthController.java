package docker_test.com.controllers.auth;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.Shop;
import docker_test.com.models.User;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.OtpService;
import docker_test.com.services.RateLimitService;
import docker_test.com.utils.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Public endpoint cho Seller TỰ đăng ký mở shop.
 * Seller submit form → tạo User (userType=seller, isActive=1, isVerified=0)
 *                    + Shop (status=PENDING) → chờ admin duyệt.
 */
@RestController
@RequestMapping("/auth/seller")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SellerAuthController {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private RateLimitService rateLimit;

    public SellerAuthController() {
        this.userRepository = UserRepository.Instance();
        this.shopRepository = ShopRepository.Instance();
    }

    private String clientIp(HttpServletRequest req) {
        String h = req.getHeader("X-Forwarded-For");
        if (h != null && !h.isBlank()) return h.split(",")[0].trim();
        return req.getRemoteAddr();
    }

    public static class SellerRegisterRequest {
        public String fullName;
        public String shopName;
        public String email;
        public String phone;
        public String password;
        public String otp; // bắt buộc (6 chữ số)
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SellerRegisterRequest req, HttpServletRequest http) throws SQLException {
        // Rate limit: 10 lần / giờ / IP
        if (!rateLimit.allow("seller-register:" + clientIp(http), 10, 60 * 60 * 1000L)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Quá nhiều yêu cầu, vui lòng thử lại sau"));
        }
        // --- 1) Validate input ---
        if (req == null) return ResponseEntity.badRequest().body(Map.of("message", "Thiếu dữ liệu"));
        if (req.fullName == null || req.fullName.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Họ tên không được để trống"));
        if (req.shopName == null || req.shopName.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Tên cửa hàng không được để trống"));
        if (req.email == null || req.email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống"));
        if (req.phone == null || req.phone.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại không được để trống"));
        if (req.password == null || req.password.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải có ít nhất 8 ký tự"));
        if (req.otp == null || req.otp.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "OTP là bắt buộc"));

        // --- 1b) Verify OTP ---
        if (!otpService.verifyAndConsume(req.email, req.otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "OTP sai hoặc đã hết hạn"));
        }

        // --- 2) Check duplicate email ---
        if (userRepository.existsByEmail(req.email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email này đã được đăng ký"));
        }

        try {
            // --- 3) Tạo User với role seller ---
            User user = new User();
            user.setEmail(req.email);
            user.setPhone(req.phone);
            user.setFullName(req.fullName);
            user.setUserType("seller");
            user.setIsVerified(0); // chưa verify
            user.setIsActive(1);   // active nhưng shop vẫn PENDING
            user.setPasswordHash(PasswordUtil.hash(req.password));

            User createdUser = userRepository.Create(user);
            if (createdUser == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Tạo tài khoản thất bại"));
            }

            // --- 4) Tạo Shop với status PENDING ---
            Shop shop = new Shop();
            shop.setUser_id(createdUser.getId());
            shop.setShop_name(req.shopName);
            shop.setStatus("PENDING");
            shop.setIs_active(1);
            shop.setIs_verified(0);

            Shop createdShop = shopRepository.Create(shop);
            if (createdShop == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Tạo shop thất bại"));
            }

            // --- 5) Trả về thông tin (không kèm password) ---
            Map<String, Object> resp = new HashMap<>();
            resp.put("userId", createdUser.getId());
            resp.put("shopId", createdShop.getId());
            resp.put("email", createdUser.getEmail());
            resp.put("shopName", createdShop.getShop_name());
            resp.put("status", "PENDING");
            resp.put("message", "Đăng ký thành công. Vui lòng chờ admin phê duyệt trong 24h.");

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống: " + ex.getMessage()));
        }
    }
}
