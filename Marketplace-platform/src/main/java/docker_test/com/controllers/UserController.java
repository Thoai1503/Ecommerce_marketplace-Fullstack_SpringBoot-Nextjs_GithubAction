package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(users);
    }

    /* ================= GET USER BY ID ================= */
    // GET http://localhost:8000/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        User user = userRepository.GetById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        return ResponseEntity.ok(user);
    }

    /* ================= CREATE USER (TEST / ADMIN) ================= */
    // POST http://localhost:8000/users
    // ⚠️ CHỈ DÙNG ĐỂ TEST – KHÔNG DÙNG CHO ĐĂNG KÝ THẬT
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            if (userRepository.existsByEmail(req.getEmail())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email already exists");
            }

            User user = new User();
            user.setEmail(req.getEmail());
            user.setFullName(req.getFullName());

            // 🔐 HASH PASSWORD – DÒNG QUYẾT ĐỊNH
            user.setPasswordHash(
                PasswordUtil.hash(req.getPassword())
            );

            User created = userRepository.Create(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Register failed");
        }
    }

    /* ================= DELETE USER ================= */
    // DELETE http://localhost:8000/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        boolean deleted = userRepository.Delete(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        return ResponseEntity.ok("Deleted successfully");
    }
}
