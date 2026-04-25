package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.dto.LoginRequest;
import docker_test.com.dto.RegisterRequest;
import docker_test.com.models.Shop;
import docker_test.com.models.User;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
//@CrossOrigin(origins = "http://localhost:3000",    allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private docker_test.com.services.DisposableEmailService disposableEmail;

    public UserController() {
        this.userRepository = UserRepository.Instance();
    }

    /* ================= CHECK EMAIL EXISTS ================= */
    // GET http://localhost:8001/users/exists?email=xxx@yyy.zz
    // Trả: { exists, disposable }
    @GetMapping("/exists")
    public ResponseEntity<?> existsByEmail(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email là bắt buộc"));
        }
        String normalized = email.trim().toLowerCase();
        boolean disposable = disposableEmail.isDisposable(normalized);
        boolean exists = userRepository.existsByEmail(normalized);
        return ResponseEntity.ok(java.util.Map.of(
                "exists", exists,
                "disposable", disposable
        ));
    }

    /* ================= CHECK PHONE EXISTS ================= */
    // GET /users/phone-exists?phone=0912xxxxxx
    @GetMapping("/phone-exists")
    public ResponseEntity<?> existsByPhone(@RequestParam String phone) {
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Số điện thoại là bắt buộc"));
        }
        // Chuẩn hoá: bỏ khoảng trắng, +84 → 0
        String normalized = phone.replaceAll("\\s+", "");
        if (normalized.startsWith("+84")) normalized = "0" + normalized.substring(3);
        if (normalized.startsWith("84") && normalized.length() == 11) normalized = "0" + normalized.substring(2);

        if (!normalized.matches("^0[35789][0-9]{8}$")) {
            return ResponseEntity.ok(java.util.Map.of("exists", false, "invalid", true));
        }

        boolean exists = userRepository.existsByPhone(normalized);
        return ResponseEntity.ok(java.util.Map.of("exists", exists, "phone", normalized));
    }

    /* ================= GET ALL USERS ================= */
    // GET http://localhost:8000/users
    @GetMapping("")
    public ResponseEntity<List<User>> getAll() {
        List<User> users = userRepository.GetAll();

        // ❌ không lộ password
        users.forEach(u -> u.setPasswordHash(null));

        return ResponseEntity.ok(users);
    }

    /* ================= GET USER BY ID ================= */
    // GET http://localhost:8000/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {

        User user = userRepository.GetById(id);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    /* ================= REGISTER ================= */
    // POST http://localhost:8000/users/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        // ✅ validate
        if (req.getEmail() == null || req.getEmail().isBlank()
                || req.getPassword() == null || req.getPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email và mật khẩu không được để trống");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email đã tồn tại");
        }

        try {
            User user = new User();
            user.setEmail(req.getEmail());
            user.setFullName(req.getFullName());

            // 🔐 HASH PASSWORD (BẮT BUỘC)
            user.setPasswordHash(
                    PasswordUtil.hash(req.getPassword())
            );

            User created = userRepository.Create(user);
            created.setPasswordHash(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Register failed");
        }
    }

    /* ================= LOGIN ================= */
    // POST http://localhost:8000/users/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req,HttpServletResponse response) {

    	
    	System.out.print("Login..");
    	
        // ✅ validate
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Thiếu email hoặc mật khẩu");
        }

        User user = userRepository.findByEmail(req.getEmail());

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Email không tồn tại");
        }

        boolean matched = PasswordUtil.verify(
                req.getPassword(),
                user.getPasswordHash()
        );

        if (!matched) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Sai mật khẩu");
        }

        if (user.getIsActive() == 0) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Tài khoản bị khóa");
        }

        // ❌ không trả password
        user.setPasswordHash(null);

        // ✅ Nếu là seller → kèm thông tin shop status để frontend redirect đúng
        Map<String, Object> extra = new HashMap<>();
        extra.put("user", user);
        if ("seller".equalsIgnoreCase(user.getUserType())) {
            Shop shop = ShopRepository.Instance().GetByUserId(user.getId().intValue());
            if (shop != null) {
                Map<String, Object> shopInfo = new HashMap<>();
                shopInfo.put("id", shop.getId());
                shopInfo.put("shopName", shop.getShop_name());
                shopInfo.put("status", shop.getStatus() != null ? shop.getStatus() : "PENDING");
                shopInfo.put("category", shop.getCategory());
                shopInfo.put("location", shop.getShop_description());
                shopInfo.put("logoUrl", shop.getShop_logo());
                shopInfo.put("website", shop.getWebsite());
                shopInfo.put("rejectionReason", shop.getRejection_reason());
                extra.put("shop", shopInfo);
            }
        }

        ResponseCookie roleCookie = ResponseCookie.from("role", user.getUserType())
    		    .httpOnly(true)
    		    .secure(false)          // requires HTTPS
    		    .path("/")
    		    .maxAge(7 * 24 * 60 * 60)
    		    .sameSite("Lax")
    		    .build();
    		response.addHeader("Set-Cookie", roleCookie.toString());
            ResponseCookie userCookie = ResponseCookie.from("user", String.valueOf(user.getId()))
        		    .httpOnly(true)
        		    .secure(false)          // requires HTTPS
        		    .path("/")
        		    .maxAge(7 * 24 * 60 * 60)
        		    .sameSite("Lax")
        		    .build();
        		response.addHeader("Set-Cookie", userCookie.toString());


        return ResponseEntity.ok(extra);
    }

    /* ================= DELETE USER ================= */
    // DELETE http://localhost:8000/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {

        boolean deleted = userRepository.Delete(id);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        return ResponseEntity.ok("Deleted successfully");
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable int id,
            @RequestBody User req
    ) {
        User existing = userRepository.GetById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        // ✅ CHỈ UPDATE CÁC FIELD CHO PHÉP
        existing.setFullName(req.getFullName());
        existing.setPhone(req.getPhone());

        // 🔒 dateOfBirth & gender chỉ set 1 lần
        if (existing.getDateOfBirth() == null) {
            existing.setDateOfBirth(req.getDateOfBirth());
        }

        if (existing.getGender() == null) {
            existing.setGender(req.getGender());
        }

        User updated = userRepository.Update(existing);

        // ❌ KHÔNG TRẢ PASSWORD
        updated.setPasswordHash(null);

        return ResponseEntity.ok(updated);
    }

}
