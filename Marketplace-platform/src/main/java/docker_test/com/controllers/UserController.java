package docker_test.com.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.dto.LoginRequest;
import docker_test.com.dto.RegisterRequest;
import docker_test.com.models.User;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;

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
    public ResponseEntity<?> getById(@PathVariable long id) {

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

            // ❌ không trả password
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

    /* ================= LOGIN ================= */
    // POST http://localhost:8000/users/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

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

        return ResponseEntity.ok(user);
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
}
