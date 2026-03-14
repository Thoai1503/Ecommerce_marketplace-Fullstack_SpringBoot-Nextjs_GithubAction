package docker_test.com.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.dto.LoginRequest;
import docker_test.com.dto.RegisterRequest;
import docker_test.com.models.PageResult;
import docker_test.com.models.User;
import docker_test.com.repository.AdminRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;
import jakarta.servlet.http.HttpServletResponse;

/**
 * USER CONTROLLER
 * Quản lý toàn bộ tài khoản (User Management screen).
 * Dùng AdminRepository để filter/search tất cả userType.
 * Auth (login/register) dùng UserRepository base.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository  userRepository;
    private final AdminRepository adminRepository;

    public UserController() {
        this.userRepository  = UserRepository.Instance();
        this.adminRepository = AdminRepository.Instance();
    }

    /* ================= AUTH ================= */

    // POST http://localhost:8000/users/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

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
            user.setPasswordHash(PasswordUtil.hash(req.getPassword()));

            User created = userRepository.Create(user);
            created.setPasswordHash(null);

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

    // POST http://localhost:8000/users/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {

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

        boolean matched = PasswordUtil.verify(req.getPassword(), user.getPasswordHash());

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

        user.setPasswordHash(null);

        ResponseCookie roleCookie = ResponseCookie.from("role", user.getUserType())
                .httpOnly(true).secure(false).path("/")
                .maxAge(7 * 24 * 60 * 60).sameSite("Lax").build();
        response.addHeader("Set-Cookie", roleCookie.toString());

        ResponseCookie userCookie = ResponseCookie.from("user", String.valueOf(user.getId()))
                .httpOnly(true).secure(false).path("/")
                .maxAge(7 * 24 * 60 * 60).sameSite("Lax").build();
        response.addHeader("Set-Cookie", userCookie.toString());

        return ResponseEntity.ok(user);
    }

    /* ================= CRUD ================= */

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

    // PUT http://localhost:8000/users/{id}
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

        existing.setFullName(req.getFullName());
        existing.setPhone(req.getPhone());

        if (existing.getDateOfBirth() == null) {
            existing.setDateOfBirth(req.getDateOfBirth());
        }

        if (existing.getGender() == null) {
            existing.setGender(req.getGender());
        }

        User updated = userRepository.Update(existing);
        updated.setPasswordHash(null);

        return ResponseEntity.ok(updated);
    }

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

    /* ================= ADMIN ACTIONS ================= */

    // PATCH http://localhost:8000/users/{id}/status
    // Body: { "isActive": 0 } hoặc { "isActive": 1 }
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, Integer> body
    ) {
        Integer isActive = body.get("isActive");

        if (isActive == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Thiếu trường isActive");
        }

        if (isActive != 0 && isActive != 1) {
            return ResponseEntity
                    .badRequest()
                    .body("isActive chỉ nhận giá trị 0 hoặc 1");
        }

        boolean ok = userRepository.setActiveStatus(id, isActive);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        return ResponseEntity.ok(isActive == 1 ? "Tài khoản đã được mở khóa" : "Tài khoản đã bị khóa");
    }

    // PATCH http://localhost:8000/users/{id}/role
    // Body: { "userType": "seller" }
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable int id,
            @RequestBody Map<String, String> body
    ) {
        String userType = body.get("userType");

        if (userType == null || userType.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Thiếu trường userType");
        }

        boolean valid = userType.equals(UserRepository.TYPE_ADMIN)
                     || userType.equals(UserRepository.TYPE_SELLER)
                     || userType.equals(UserRepository.TYPE_BUYER)
                     || userType.equals(UserRepository.TYPE_SHIPPER)
                     || userType.equals(UserRepository.TYPE_BOTH);

        if (!valid) {
            return ResponseEntity
                    .badRequest()
                    .body("userType không hợp lệ. Chỉ chấp nhận: admin | seller | buyer | shipper | both");
        }

        boolean ok = adminRepository.changeUserType(id, userType);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        return ResponseEntity.ok("Cập nhật role thành công");
    }

    /* ================= FILTER ALL USERS (User Management screen) ================= */
    // GET http://localhost:8000/users/filter?keyword=abc&userType=seller&isActive=1&page=1&pageSize=20
    @GetMapping("/filter")
    public ResponseEntity<PageResult<User>> filter(
            @RequestParam(required = false)    String  keyword,
            @RequestParam(required = false)    String  userType,
            @RequestParam(required = false)    Integer isActive,
            @RequestParam(defaultValue = "1")  int     page,
            @RequestParam(defaultValue = "20") int     pageSize
    ) {
        PageResult<User> result = adminRepository.Filter(keyword, userType, isActive, page, pageSize);
        result.getData().forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(result);
    }
}
