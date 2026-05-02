package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import docker_test.com.dto.LoginRequest;
import docker_test.com.dto.LoginResponse;
import docker_test.com.dto.ForgotPasswordRequest;
import docker_test.com.dto.RegisterRequest;
import docker_test.com.dto.ResetPasswordRequest;
import docker_test.com.models.User;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;
import docker_test.com.services.CloudinaryService;
import docker_test.com.services.EmailVerificationService;
import docker_test.com.services.PasswordResetService;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/users")
//@CrossOrigin(origins = "http://localhost:3000",    allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;
    
    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private PasswordResetService passwordResetService;

    public UserController() {
        this.userRepository = UserRepository.Instance();
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
    public ResponseEntity<?> register(@RequestBody RegisterRequest req,HttpServletResponse response) {

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
            user.setIsVerified(0);

            // 🔐 HASH PASSWORD (BẮT BUỘC)
            user.setPasswordHash(
                    PasswordUtil.hash(req.getPassword())
            );

            User created = userRepository.Create(user);
            try {
                emailVerificationService.sendVerificationEmail(created);
            } catch (Exception mailError) {
                System.err.println("Failed to send verification email to " + created.getEmail());
                mailError.printStackTrace();
            }
            
            System.out.println("Created user: " + created.toString());

            // ❌ không trả password
            created.setPasswordHash(null);
            
            System.out.println("User registered successfully: " + created.toString());
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Register failed");
        }
    }

    /* ================= VERIFY EMAIL ================= */
    // GET http://localhost:8000/users/verify-email?token=...
    @GetMapping(value = "/verify-email", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        try {
            String email = emailVerificationService.readEmailFromToken(token);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("<h1>Verification failed</h1><p>User not found.</p>");
            }

            if (user.getIsVerified() != null && user.getIsVerified() == 1) {
                return ResponseEntity.ok(
                        "<h1>Email already verified</h1><p>You can log in to Nexamart now.</p>");
            }

            if (!userRepository.markEmailVerified(email)) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("<h1>Verification failed</h1><p>Unable to update this account.</p>");
            }

            return ResponseEntity.ok(
                    "<h1>Email verified successfully</h1><p>You can log in to Nexamart now.</p>");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body("<h1>Verification failed</h1><p>" + e.getMessage() + "</p>");
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
        if (user.getId() == null) {
            user.setId(userRepository.findUserIdByEmail(req.getEmail()));
        }
        Long resolvedUserId = user.getId();
        
        ResponseCookie roleCookie = ResponseCookie.from("role", user.getUserType())
    		    .httpOnly(true)
    		    .secure(false)          // requires HTTPS
    		    .path("/")
    		    .maxAge(7 * 24 * 60 * 60)
    		    .sameSite("Lax")
    		    .build();
    		response.addHeader("Set-Cookie", roleCookie.toString());
            ResponseCookie userCookie = ResponseCookie.from("user", String.valueOf(resolvedUserId))
        		    .httpOnly(true)
        		    .secure(false)          // requires HTTPS
        		    .path("/")
        		    .maxAge(7 * 24 * 60 * 60)
        		    .sameSite("Lax")
        		    .build();
        		response.addHeader("Set-Cookie", userCookie.toString());
        
        return ResponseEntity.ok(
            new LoginResponse(
                resolvedUserId,
                user.getEmail(),
                user.getFullName(),
                user.getUserType()
            )
        );
    }

    /* ================= FORGOT PASSWORD ================= */
    // POST http://localhost:8000/users/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req == null || req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email không được để trống");
        }

        try {
            passwordResetService.requestPasswordReset(req.getEmail());
            return ResponseEntity.ok("Nếu email tồn tại, hệ thống đã gửi link đặt lại mật khẩu");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tạo yêu cầu đặt lại mật khẩu");
        }
    }

    /* ================= RESET PASSWORD ================= */
    // POST http://localhost:8000/users/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req == null || req.getToken() == null || req.getToken().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Token không được để trống");
        }

        if (req.getPassword() == null || req.getPassword().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Mật khẩu mới không được để trống");
        }

        if (req.getPassword().length() < 6) {
            return ResponseEntity
                    .badRequest()
                    .body("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        try {
            if (!passwordResetService.resetPassword(req.getToken(), req.getPassword())) {
                return ResponseEntity
                        .badRequest()
                        .body("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
            }

            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể đổi mật khẩu");
        }
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

        // 🔍 Kiểm tra trùng phone (nếu có thay đổi)
        if (req.getPhone() != null && !req.getPhone().isEmpty()) {
            User phoneUser = userRepository.findByPhone(req.getPhone());
            if (phoneUser != null && !phoneUser.getId().equals(existing.getId())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Số điện thoại đã được sử dụng");
            }
        }

        User updated = userRepository.Update(existing);

        if (updated == null) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật thất bại");
        }

        // ❌ KHÔNG TRẢ PASSWORD
        updated.setPasswordHash(null);

        return ResponseEntity.ok(updated);
    }
    
    /* ================= UPDATE AVATAR ================= */
    // POST http://localhost:8000/users/{id}/avatar
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAvatar(
            @PathVariable int id,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        User existing = userRepository.GetById(id);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        String avatarUrl = null;
        if (avatar != null && !avatar.isEmpty()) {
            try {
                // Upload to Cloudinary
                avatarUrl = cloudinaryService.uploadFile(avatar);
            } catch (Exception e) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Avatar upload failed: " + e.getMessage());
            }
        }

        // Update avatar in database
        User updated = userRepository.updateAvatar(id, avatarUrl);

        if (updated == null) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update avatar");
        }

        // ❌ KHÔNG TRẢ PASSWORD
        updated.setPasswordHash(null);

        return ResponseEntity.ok(updated);
    }

}