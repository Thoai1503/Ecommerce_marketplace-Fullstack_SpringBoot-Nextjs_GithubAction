package docker_test.com.controllers.auth;

import docker_test.com.dto.ApiError;
import docker_test.com.dto.auth.LoginRequestDTO;
import docker_test.com.dto.auth.LoginResponseDTO;
import docker_test.com.dto.auth.UserDto;
import docker_test.com.models.User;
import docker_test.com.repository.RefreshSessionRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.services.JwtService;
import docker_test.com.models.RefreshSession;
import docker_test.com.utils.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController("jwtAuthController")
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final RefreshSessionRepository refreshSessionRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final CookieUtil cookieUtil;

    @Value("${jwt.cookie-name}")
    private String cookieName;

    @Value("${jwt.cookie-path}")
    private String cookiePath;

    @Value("${jwt.cookie-secure}")
    private boolean cookieSecure;

    @Value("${jwt.cookie-same-site}")
    private String cookieSameSite;

    public AuthController(UserRepository userRepository,
                          RefreshSessionRepository refreshSessionRepository,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder,
                          CookieUtil cookieUtil) {
        this.userRepository = userRepository;
        this.refreshSessionRepository = refreshSessionRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.cookieUtil = cookieUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request,
                                   HttpServletRequest req,
                                   HttpServletResponse res) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return error(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                    "Email hoặc mật khẩu không đúng", req.getRequestURI());
        }

        String role = user.getRole();
        if (!"ADMIN".equals(role) && !"SELLER".equals(role) && !"SUPER_ADMIN".equals(role)) {
            return error(HttpStatus.FORBIDDEN, "ROLE_NOT_ALLOWED",
                    "Tài khoản này không có quyền truy cập. Vui lòng dùng trang đăng nhập khách hàng.",
                    req.getRequestURI());
        }

        if (user.getIsActive() == null || user.getIsActive() != 1) {
            return error(HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED",
                    "Tài khoản đã bị khóa", req.getRequestURI());
        }

        String accessToken = jwtService.createAccessToken(user.getId(), role);
        String opaqueRefresh = jwtService.createOpaqueRefreshToken();
        String tokenHash = jwtService.hashRefresh(opaqueRefresh);
        String sessionId = UUID.randomUUID().toString();
        Timestamp expiresAt = Timestamp.from(
                Instant.now().plus(jwtService.getRefreshTtlDays(), ChronoUnit.DAYS)
        );
        String userAgent = trimTo(req.getHeader("User-Agent"), 500);
        String ip = req.getRemoteAddr();

        refreshSessionRepository.createSession(sessionId, user.getId(), tokenHash, userAgent, ip, expiresAt);

        ResponseCookie cookie = ResponseCookie.from(cookieName, opaqueRefresh)
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .maxAge(jwtService.getRefreshTtlDays() * 24 * 60 * 60)
                .sameSite(cookieSameSite)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new LoginResponseDTO(accessToken, toDto(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long userId)) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Chưa đăng nhập", req.getRequestURI());
        }

        User user = userRepository.findById(userId);
        if (user == null || user.getIsActive() == null || user.getIsActive() != 1) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Chưa đăng nhập", req.getRequestURI());
        }

        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest req, HttpServletResponse res) {
        String cookieValue = cookieUtil.readRefreshCookie(req);
        if (cookieValue == null) {
            return refreshInvalid(req, res);
        }

        String tokenHash = jwtService.hashRefresh(cookieValue);
        RefreshSession session = refreshSessionRepository.findByTokenHash(tokenHash);
        if (session == null) {
            RefreshSession oldSession = refreshSessionRepository.findAnyByTokenHash(tokenHash);
            if (oldSession != null && refreshSessionRepository.hasRotatedChild(oldSession.getId())) {
                refreshSessionRepository.revokeAllByUserId(oldSession.getUserId());
            }
            return refreshInvalid(req, res);
        }

        if (refreshSessionRepository.hasRotatedChild(session.getId())) {
            refreshSessionRepository.revokeAllByUserId(session.getUserId());
            return refreshInvalid(req, res);
        }

        User user = userRepository.findById(session.getUserId());
        if (user == null || user.getIsActive() == null || user.getIsActive() != 1) {
            return refreshInvalid(req, res);
        }

        String newAccessToken = jwtService.createAccessToken(user.getId(), user.getRole());
        String opaqueRefresh = jwtService.createOpaqueRefreshToken();
        String newHash = jwtService.hashRefresh(opaqueRefresh);
        String newSessionId = UUID.randomUUID().toString();
        Timestamp newExpiresAt = Timestamp.from(
                Instant.now().plus(jwtService.getRefreshTtlDays(), ChronoUnit.DAYS)
        );
        String userAgent = trimTo(req.getHeader("User-Agent"), 500);
        String ip = req.getRemoteAddr();

        refreshSessionRepository.rotate(
                session.getId(),
                newSessionId,
                session.getUserId(),
                newHash,
                newExpiresAt,
                userAgent,
                ip
        );
        cookieUtil.setRefreshCookie(res, opaqueRefresh, refreshMaxAgeSeconds());

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req, HttpServletResponse res) {
        String cookieValue = cookieUtil.readRefreshCookie(req);
        if (cookieValue != null) {
            String tokenHash = jwtService.hashRefresh(cookieValue);
            RefreshSession session = refreshSessionRepository.findByTokenHash(tokenHash);
            if (session != null) {
                refreshSessionRepository.revokeById(session.getId());
            }
        }

        cookieUtil.clearRefreshCookie(res);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAll(HttpServletRequest req, HttpServletResponse res) {
        Long userId = currentUserId(req);
        if (userId == null) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Chưa đăng nhập", req.getRequestURI());
        }

        int count = refreshSessionRepository.revokeAllByUserId(userId);
        cookieUtil.clearRefreshCookie(res);
        return ResponseEntity.ok(Map.of("success", true, "revokedSessions", count));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> sessions(HttpServletRequest req) {
        Long userId = currentUserId(req);
        if (userId == null) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Chưa đăng nhập", req.getRequestURI());
        }

        String currentHash = null;
        String cookieValue = cookieUtil.readRefreshCookie(req);
        if (cookieValue != null) {
            currentHash = jwtService.hashRefresh(cookieValue);
        }

        String finalCurrentHash = currentHash;
        List<Map<String, Object>> body = refreshSessionRepository.findActiveByUserId(userId).stream()
                .map(session -> {
                    Map<String, Object> dto = new LinkedHashMap<>();
                    dto.put("id", session.getId());
                    dto.put("userAgent", session.getUserAgent());
                    dto.put("ipLast", session.getIpLast());
                    dto.put("lastUsedAt", session.getLastUsedAt());
                    dto.put("createdAt", session.getCreatedAt());
                    dto.put("current", finalCurrentHash != null && finalCurrentHash.equals(session.getTokenHash()));
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(body);
    }

    @PostMapping("/sessions/{sessionId}/revoke")
    public ResponseEntity<?> revokeSession(@PathVariable String sessionId, HttpServletRequest req) {
        Long userId = currentUserId(req);
        if (userId == null) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Chưa đăng nhập", req.getRequestURI());
        }

        RefreshSession session = refreshSessionRepository.findById(sessionId);
        if (session == null || !userId.equals(session.getUserId())) {
            return error(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "Session không tồn tại", req.getRequestURI());
        }

        refreshSessionRepository.revokeById(sessionId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    private ResponseEntity<ApiError> refreshInvalid(HttpServletRequest req, HttpServletResponse res) {
        cookieUtil.clearRefreshCookie(res);
        return error(HttpStatus.UNAUTHORIZED, "REFRESH_INVALID",
                "Phiên đã hết hạn, vui lòng đăng nhập lại.", req.getRequestURI());
    }

    private Long currentUserId(HttpServletRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long userId)) {
            return null;
        }
        return userId;
    }

    private long refreshMaxAgeSeconds() {
        return jwtService.getRefreshTtlDays() * 24 * 60 * 60;
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String error, String message, String path) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), error, message, path));
    }

    private String trimTo(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
