package docker_test.com.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import docker_test.com.dto.LoginRequest;
import docker_test.com.dto.RefreshTokenRequest;
import docker_test.com.models.User;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.AuthService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository ;
    public AuthController(AuthService authService) {
        this.authService = authService;
        this.userRepository = UserRepository.Instance();
    }
    
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


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        try {
            var loginResponse = authService.login(req);
            authService.addAuthCookies(loginResponse, response);
            return ResponseEntity.ok(loginResponse);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @GetMapping({ "/me", "/verify" })
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            return ResponseEntity.ok(authService.authenticate(authorization));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (JwtException | IllegalArgumentException e) {
            return ResponseEntity.status(401).body("Token không hợp lệ hoặc đã hết hạn");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestBody(required = false) RefreshTokenRequest req,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            var loginResponse = authService.refresh(resolveRefreshToken(req, request));
            authService.addAuthCookies(loginResponse, response);
            return ResponseEntity.ok(loginResponse);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (JwtException | IllegalArgumentException e) {
            return ResponseEntity.status(401).body("Refresh token không hợp lệ hoặc đã hết hạn");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        authService.clearAuthCookies(response);
        return ResponseEntity.ok("Logged out");
    }

    private String resolveRefreshToken(RefreshTokenRequest req, HttpServletRequest request) {
        if (req != null && req.getRefreshToken() != null && !req.getRefreshToken().isBlank()) {
            return req.getRefreshToken();
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
